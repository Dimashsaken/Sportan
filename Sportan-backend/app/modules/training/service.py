import uuid
from datetime import datetime, timedelta

from fastapi import HTTPException
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.coaching import models as coaching_models
from app.modules.coaching import service as coaching_service
from app.modules.identity import models as identity_models
from app.modules.training import models as training_models
from app.modules.training import schemas as training_schemas

# --- Assignments ---


async def create_assignment_for_group(
    db: AsyncSession, coach_id: uuid.UUID, group_id: uuid.UUID, data: training_schemas.AssignedWorkoutCreate
) -> list[training_models.AssignedWorkout]:
    # Get athletes in group
    athletes = await coaching_service.get_group_athletes(db, group_id, coach_id)

    assignments = []
    for athlete in athletes:
        assignment = training_models.AssignedWorkout(
            athlete_id=athlete.id,
            scheduled_date=data.scheduled_date,
            title=data.title,
            description=data.description,
            status=training_models.WorkoutStatus.PENDING,
        )
        db.add(assignment)
        assignments.append(assignment)

    await db.commit()
    return assignments


async def create_assignment_for_athlete(
    db: AsyncSession, coach_id: uuid.UUID, athlete_id: uuid.UUID, data: training_schemas.AssignedWorkoutCreate
) -> training_models.AssignedWorkout:
    # Verify athlete belongs to coach
    # coaching_service.get_athlete checks ownership
    await coaching_service.get_athlete(db, athlete_id, coach_id)

    assignment = training_models.AssignedWorkout(
        athlete_id=athlete_id,
        scheduled_date=data.scheduled_date,
        title=data.title,
        description=data.description,
        status=training_models.WorkoutStatus.PENDING,
    )
    db.add(assignment)
    await db.commit()
    await db.refresh(assignment)
    return assignment


async def update_assignment_status(
    db: AsyncSession, assigned_workout_id: uuid.UUID, status_enum: training_models.WorkoutStatus
) -> training_models.AssignedWorkout:
    result = await db.execute(
        select(training_models.AssignedWorkout).where(training_models.AssignedWorkout.id == assigned_workout_id)
    )
    assignment = result.scalars().first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    assignment.status = status_enum
    await db.commit()
    await db.refresh(assignment)
    return assignment


async def get_coach_group_assignments(
    db: AsyncSession, coach_id: uuid.UUID, group_id: uuid.UUID
) -> list[training_models.AssignedWorkout]:
    # Verify group
    await coaching_service.get_group_by_id(db, group_id, coach_id)

    # Get athletes
    # We need to query Assignments where athlete is in group
    # Join GroupAthlete
    query = (
        select(training_models.AssignedWorkout)
        .join(identity_models.Athlete, training_models.AssignedWorkout.athlete_id == identity_models.Athlete.id)
        .join(coaching_models.GroupAthlete, identity_models.Athlete.id == coaching_models.GroupAthlete.athlete_id)
        .where(coaching_models.GroupAthlete.group_id == group_id)
    )
    result = await db.execute(query)
    return list(result.scalars().all())


async def get_athlete_assignments(db: AsyncSession, athlete_id: uuid.UUID) -> list[training_models.AssignedWorkout]:
    result = await db.execute(
        select(training_models.AssignedWorkout).where(training_models.AssignedWorkout.athlete_id == athlete_id)
    )
    return list(result.scalars().all())


# --- Workouts ---


async def log_workout(
    db: AsyncSession, coach_id: uuid.UUID, data: training_schemas.WorkoutCreate
) -> training_models.Workout:
    # Verify athlete
    await coaching_service.get_athlete(db, data.athlete_id, coach_id)

    workout = training_models.Workout(
        athlete_id=data.athlete_id,
        assigned_workout_id=data.assigned_workout_id,
        date=data.date,
        title=data.title,
        notes=data.notes,
        metrics=data.metrics,
    )

    db.add(workout)

    # If linked to assignment, update status
    if data.assigned_workout_id:
        result = await db.execute(
            select(training_models.AssignedWorkout).where(
                training_models.AssignedWorkout.id == data.assigned_workout_id
            )
        )
        assignment = result.scalars().first()
        if assignment:
            if assignment.athlete_id != data.athlete_id:
                raise HTTPException(status_code=400, detail="Assignment does not belong to this athlete")
            assignment.status = training_models.WorkoutStatus.COMPLETED
            db.add(assignment)  # Ensure update

    await db.commit()
    await db.refresh(workout)
    return workout


async def get_workout(db: AsyncSession, workout_id: uuid.UUID) -> training_models.Workout:
    result = await db.execute(select(training_models.Workout).where(training_models.Workout.id == workout_id))
    workout = result.scalars().first()
    if not workout:
        raise HTTPException(status_code=404, detail="Workout not found")
    return workout


async def update_workout(
    db: AsyncSession, workout_id: uuid.UUID, data: training_schemas.WorkoutUpdate
) -> training_models.Workout:
    workout = await get_workout(db, workout_id)

    if data.title is not None:
        workout.title = data.title
    if data.date is not None:
        workout.date = data.date
    if data.notes is not None:
        workout.notes = data.notes
    if data.metrics is not None:
        workout.metrics = data.metrics

    await db.commit()
    await db.refresh(workout)
    return workout


async def delete_workout(db: AsyncSession, workout_id: uuid.UUID):
    workout = await get_workout(db, workout_id)

    # Cascade rule: Deleting workout deletes assigned_workout too if linked
    if workout.assigned_workout_id:
        # We need to delete assignment.
        # Fetch assignment
        result = await db.execute(
            select(training_models.AssignedWorkout).where(
                training_models.AssignedWorkout.id == workout.assigned_workout_id
            )
        )
        assignment = result.scalars().first()
        if assignment:
            # Delete assignment. This logic implies we delete the PLAN if the EXECUTION is deleted?
            # Spec says: "Deleting a workout that has assigned_workout_id deletes the assigned_workout too."
            # This is aggressive but follows spec.
            # Note: Deleting assignment *might* cascade back to workout if we configured it so.
            # But we are already deleting workout.
            # To avoid conflict or double delete, we can just delete assignment.
            # Since assignment has `cascade="all, delete-orphan"` for workout, deleting assignment deletes workout.
            # So if we delete assignment here, workout will be deleted by cascade.
            # So we should just delete assignment?
            # But `db.delete(workout)` is already staged?
            # Safest is to delete assignment.
            await db.delete(assignment)
            await db.commit()
            return

    await db.delete(workout)
    await db.commit()


async def get_athlete_workouts(db: AsyncSession, athlete_id: uuid.UUID) -> list[training_models.Workout]:
    result = await db.execute(select(training_models.Workout).where(training_models.Workout.athlete_id == athlete_id))
    return list(result.scalars().all())


# --- Summary & Analytics ---


async def get_athlete_summary(db: AsyncSession, athlete_id: uuid.UUID) -> training_schemas.AthleteSummary:
    # 1. Total Workouts
    total_res = await db.execute(
        select(func.count(training_models.Workout.id)).where(training_models.Workout.athlete_id == athlete_id)
    )
    total_workouts = total_res.scalar() or 0

    # 2. Workouts this week
    today = datetime.utcnow().date()
    week_start = today - timedelta(days=today.weekday())  # Monday
    week_res = await db.execute(
        select(func.count(training_models.Workout.id)).where(
            training_models.Workout.athlete_id == athlete_id, training_models.Workout.date >= week_start
        )
    )
    workouts_this_week = week_res.scalar() or 0

    # 3. Workouts this month
    month_start = today.replace(day=1)
    month_res = await db.execute(
        select(func.count(training_models.Workout.id)).where(
            training_models.Workout.athlete_id == athlete_id, training_models.Workout.date >= month_start
        )
    )
    workouts_this_month = month_res.scalar() or 0

    # 4. Last workout date
    last_res = await db.execute(
        select(training_models.Workout.date)
        .where(training_models.Workout.athlete_id == athlete_id)
        .order_by(training_models.Workout.date.desc())
        .limit(1)
    )
    last_workout_date = last_res.scalar()

    return training_schemas.AthleteSummary(
        total_workouts=total_workouts,
        workouts_this_week=workouts_this_week,
        workouts_this_month=workouts_this_month,
        last_workout_date=last_workout_date,
    )


async def update_skipped_assignments(db: AsyncSession):
    """
    Marks assignments as SKIPPED if scheduled_date < today and status is PENDING.
    """
    today = datetime.utcnow().date()

    # Find assignments
    # We could use update() directly
    stmt = select(training_models.AssignedWorkout).where(
        training_models.AssignedWorkout.status == training_models.WorkoutStatus.PENDING,
        training_models.AssignedWorkout.scheduled_date < today,
    )
    result = await db.execute(stmt)
    assignments = result.scalars().all()

    count = 0
    for a in assignments:
        a.status = training_models.WorkoutStatus.SKIPPED
        count += 1

    await db.commit()
    return count
