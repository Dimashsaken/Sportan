import uuid
from datetime import date, datetime
from enum import Enum
from typing import TYPE_CHECKING, Optional

from sqlalchemy import JSON, Date, DateTime, ForeignKey, String
from sqlalchemy import Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.modules.identity.models import Athlete


class WorkoutStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    SKIPPED = "skipped"


class AssignedWorkout(Base):
    __tablename__ = "assigned_workouts"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    athlete_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("athletes.id"), nullable=False)

    scheduled_date: Mapped[date] = mapped_column(Date)
    title: Mapped[str] = mapped_column(String)
    description: Mapped[str | None] = mapped_column(String, nullable=True)
    status: Mapped[WorkoutStatus] = mapped_column(SQLEnum(WorkoutStatus), default=WorkoutStatus.PENDING)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    athlete: Mapped["Athlete"] = relationship("app.modules.identity.models.Athlete", back_populates="assigned_workouts")

    workout: Mapped[Optional["Workout"]] = relationship(
        "Workout", back_populates="assigned_workout", uselist=False, cascade="all, delete-orphan", single_parent=True
    )


class Workout(Base):
    __tablename__ = "workouts"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    athlete_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("athletes.id"), nullable=False)
    assigned_workout_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("assigned_workouts.id"),
        nullable=True,
        unique=True,
    )

    date: Mapped[date] = mapped_column(Date)
    title: Mapped[str] = mapped_column(String)
    notes: Mapped[str | None] = mapped_column(String, nullable=True)
    metrics: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    athlete: Mapped["Athlete"] = relationship("app.modules.identity.models.Athlete", back_populates="workouts")
    assigned_workout: Mapped[Optional["AssignedWorkout"]] = relationship("AssignedWorkout", back_populates="workout")
