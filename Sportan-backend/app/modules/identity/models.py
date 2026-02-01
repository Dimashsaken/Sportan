import uuid
from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Date, DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.modules.ai.models import TalentReport, WeeklyInsight
    from app.modules.coaching.models import Group, GroupAthlete
    from app.modules.training.models import AssignedWorkout, Workout


class Coach(Base):
    __tablename__ = "coaches"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String, unique=True, index=True)
    full_name: Mapped[str] = mapped_column(String)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    athletes: Mapped[list["Athlete"]] = relationship(back_populates="coach", cascade="all, delete-orphan")
    groups: Mapped[list["Group"]] = relationship(
        "app.modules.coaching.models.Group", back_populates="coach", cascade="all, delete-orphan"
    )


class Athlete(Base):
    __tablename__ = "athletes"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    coach_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("coaches.id"), nullable=False)
    full_name: Mapped[str] = mapped_column(String)
    dob: Mapped[Date | None] = mapped_column(Date, nullable=True)
    notes: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    coach: Mapped["Coach"] = relationship(back_populates="athletes")
    parent: Mapped[Optional["Parent"]] = relationship(
        back_populates="athlete", uselist=False, cascade="all, delete-orphan"
    )
    athlete_groups: Mapped[list["GroupAthlete"]] = relationship(
        "app.modules.coaching.models.GroupAthlete", back_populates="athlete", cascade="all, delete-orphan"
    )
    workouts: Mapped[list["Workout"]] = relationship(
        "app.modules.training.models.Workout", back_populates="athlete", cascade="all, delete-orphan"
    )
    assigned_workouts: Mapped[list["AssignedWorkout"]] = relationship(
        "app.modules.training.models.AssignedWorkout", back_populates="athlete", cascade="all, delete-orphan"
    )
    talent_reports: Mapped[list["TalentReport"]] = relationship(
        "app.modules.ai.models.TalentReport", back_populates="athlete", cascade="all, delete-orphan"
    )
    weekly_insights: Mapped[list["WeeklyInsight"]] = relationship(
        "app.modules.ai.models.WeeklyInsight", back_populates="athlete", cascade="all, delete-orphan"
    )


class Parent(Base):
    __tablename__ = "parents"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    athlete_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("athletes.id"), unique=True, nullable=False)
    email: Mapped[str] = mapped_column(String, unique=True, index=True)
    full_name: Mapped[str] = mapped_column(String)
    phone: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    athlete: Mapped["Athlete"] = relationship(back_populates="parent")
