import uuid
from datetime import datetime, timedelta

from openai import AsyncOpenAI, OpenAIError
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.modules.ai import models as ai_models
from app.modules.coaching import service as coaching_service
from app.modules.training import models as training_models
from app.modules.training import service as training_service

ai_client = AsyncOpenAI(api_key=settings.AI_API_KEY, base_url=settings.AI_BASE_URL)


class AIReportGenerationError(Exception):
    """Raised when the AI provider fails to return a usable report."""


async def _create_ai_report(prompt: str) -> str:
    try:
        completion = await ai_client.chat.completions.create(
            model=settings.AI_DEFAULT_MODEL,
            messages=[{"role": "user", "content": prompt}],
        )
    except OpenAIError as exc:
        raise AIReportGenerationError(f"AI provider error: {exc}") from exc

    message = completion.choices[0].message
    content = getattr(message, "content", None)
    if isinstance(content, list):
        content = "".join(
            part.get("text", "") if isinstance(part, dict) else str(part) for part in content
        )
    if not content:
        raise AIReportGenerationError("AI provider returned an empty response")
    return content


async def generate_talent_report(
    db: AsyncSession, athlete_id: uuid.UUID, coach_id: uuid.UUID
) -> ai_models.TalentReport:
    # 1. Verify ownership and get data
    athlete = await coaching_service.get_athlete(db, athlete_id, coach_id)
    workouts = await training_service.get_athlete_workouts(db, athlete_id)

    # 2. Prepare Prompt
    workouts_text = "\n".join([f"- {w.date}: {w.title} ({w.metrics}, {w.notes})" for w in workouts])

    prompt = f"""
    Analyze the athletic potential of this athlete based on the following data:
    
    Profile:
    - Name: {athlete.full_name}
    - DOB: {athlete.dob}
    - Notes: {athlete.notes}
    
    Workout History:
    {workouts_text}
    
    Please provide a 'Talent Recognition' report identifying:
    1. Demonstrated strengths.
    2. Areas for improvement.
    3. Potential athletic specialization or traits.
    4. Recommendations for development.
    """

    report_content = await _create_ai_report(prompt)

    # 4. Save Report
    report = ai_models.TalentReport(athlete_id=athlete_id, report_text=report_content)
    db.add(report)
    await db.commit()
    await db.refresh(report)

    return report


async def get_latest_talent_report(db: AsyncSession, athlete_id: uuid.UUID) -> ai_models.TalentReport | None:
    result = await db.execute(
        select(ai_models.TalentReport)
        .where(ai_models.TalentReport.athlete_id == athlete_id)
        .order_by(desc(ai_models.TalentReport.created_at))
        .limit(1)
    )
    return result.scalars().first()


async def generate_weekly_insights(
    db: AsyncSession, athlete_id: uuid.UUID, coach_id: uuid.UUID
) -> ai_models.WeeklyInsight:
    # 1. Verify ownership and get data
    athlete = await coaching_service.get_athlete(db, athlete_id, coach_id)

    # Get workouts from last 7 days
    today = datetime.utcnow().date()
    week_ago = today - timedelta(days=7)

    # We need a filtered query. training_service.get_athlete_workouts returns all.
    # I'll construct a query here.
    query = (
        select(training_models.Workout)
        .where(training_models.Workout.athlete_id == athlete_id, training_models.Workout.date >= week_ago)
        .order_by(training_models.Workout.date)
    )
    result = await db.execute(query)
    workouts = result.scalars().all()

    if not workouts:
        # Can't generate insight without data
        # Or generate a "No training recorded" report
        report_content = "No training data recorded for the last 7 days."
    else:
        workouts_text = "\n".join([f"- {w.date}: {w.title} ({w.metrics}, {w.notes})" for w in workouts])

        prompt = f"""
        Analyze the training week ({week_ago} to {today}) for:
        Athlete: {athlete.full_name}
        
        Workouts:
        {workouts_text}
        
        Provide 'Weekly Insights' covering:
        1. Consistency and Volume.
        2. Intensity and Progress.
        3. Quality of sessions.
        4. Quick tip for next week.
        """

        report_content = await _create_ai_report(prompt)

    # Save
    report = ai_models.WeeklyInsight(athlete_id=athlete_id, report_text=report_content)
    db.add(report)
    await db.commit()
    await db.refresh(report)
    return report


async def get_latest_weekly_insight(db: AsyncSession, athlete_id: uuid.UUID) -> ai_models.WeeklyInsight | None:
    result = await db.execute(
        select(ai_models.WeeklyInsight)
        .where(ai_models.WeeklyInsight.athlete_id == athlete_id)
        .order_by(desc(ai_models.WeeklyInsight.created_at))
        .limit(1)
    )
    return result.scalars().first()
