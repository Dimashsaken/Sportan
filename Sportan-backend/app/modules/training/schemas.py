from datetime import date as date_type
from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.modules.training.models import WorkoutStatus


# --- Assigned Workout Schemas ---
class AssignedWorkoutBase(BaseModel):
    title: str
    description: str | None = None
    scheduled_date: date_type


class AssignedWorkoutCreate(AssignedWorkoutBase):
    pass


class AssignedWorkoutUpdate(BaseModel):
    status: WorkoutStatus


class AssignedWorkoutRead(AssignedWorkoutBase):
    id: UUID
    athlete_id: UUID
    status: WorkoutStatus
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# --- Workout Schemas ---
class WorkoutBase(BaseModel):
    title: str
    date: date_type
    notes: str | None = None
    metrics: dict[str, Any] | None = None


class WorkoutCreate(WorkoutBase):
    athlete_id: UUID
    assigned_workout_id: UUID | None = None


class WorkoutUpdate(BaseModel):
    title: str | None = None
    date: date_type | None = None
    notes: str | None = None
    metrics: dict[str, Any] | None = None


class WorkoutRead(WorkoutBase):
    id: UUID
    athlete_id: UUID
    assigned_workout_id: UUID | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# --- Summary Schema ---
class AthleteSummary(BaseModel):
    total_workouts: int
    workouts_this_week: int
    workouts_this_month: int
    last_workout_date: date_type | None = None
