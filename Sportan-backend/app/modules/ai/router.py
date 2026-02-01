from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.modules.ai import schemas as ai_schemas
from app.modules.ai import service as ai_service
from app.modules.ai.service import AIReportGenerationError
from app.modules.coaching import service as coaching_service
from app.modules.identity import models as identity_models
from app.modules.identity import service as identity_service

router = APIRouter(tags=["ai"])

CoachDep = Annotated[identity_models.Coach, Depends(identity_service.get_current_coach)]
ParentDep = Annotated[identity_models.Parent, Depends(identity_service.get_current_parent)]
DbDep = Annotated[AsyncSession, Depends(get_db)]


# --- Coach AI Operations ---


@router.post("/coach/athletes/{athlete_id}/ai/talent-recognition", response_model=ai_schemas.ReportRead)
async def generate_talent_report(athlete_id: UUID, coach: CoachDep, db: DbDep):
    try:
        return await ai_service.generate_talent_report(db, athlete_id, coach.id)
    except AIReportGenerationError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc


@router.get("/coach/athletes/{athlete_id}/ai/talent-recognition", response_model=ai_schemas.ReportRead)
async def get_talent_report_coach(athlete_id: UUID, coach: CoachDep, db: DbDep):
    # Verify ownership
    await coaching_service.get_athlete(db, athlete_id, coach.id)

    report = await ai_service.get_latest_talent_report(db, athlete_id)
    if not report:
        raise HTTPException(status_code=404, detail="No report found")
    return report


@router.post("/coach/athletes/{athlete_id}/ai/weekly-insights", response_model=ai_schemas.ReportRead)
async def generate_weekly_insights(athlete_id: UUID, coach: CoachDep, db: DbDep):
    try:
        return await ai_service.generate_weekly_insights(db, athlete_id, coach.id)
    except AIReportGenerationError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc


@router.get("/coach/athletes/{athlete_id}/ai/weekly-insights", response_model=ai_schemas.ReportRead)
async def get_weekly_insights_coach(athlete_id: UUID, coach: CoachDep, db: DbDep):
    await coaching_service.get_athlete(db, athlete_id, coach.id)

    report = await ai_service.get_latest_weekly_insight(db, athlete_id)
    if not report:
        raise HTTPException(status_code=404, detail="No report found")
    return report


# --- Parent AI Views ---


@router.get("/parent/athlete/ai/talent-recognition", response_model=ai_schemas.ReportRead)
async def get_talent_report_parent(parent: ParentDep, db: DbDep):
    report = await ai_service.get_latest_talent_report(db, parent.athlete_id)
    if not report:
        raise HTTPException(status_code=404, detail="No report found")
    return report


@router.get("/parent/athlete/ai/weekly-insights", response_model=ai_schemas.ReportRead)
async def get_weekly_insights_parent(parent: ParentDep, db: DbDep):
    report = await ai_service.get_latest_weekly_insight(db, parent.athlete_id)
    if not report:
        raise HTTPException(status_code=404, detail="No report found")
    return report
