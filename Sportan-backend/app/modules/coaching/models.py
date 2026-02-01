import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.modules.identity.models import Athlete, Coach


class Group(Base):
    __tablename__ = "groups"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    coach_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("coaches.id"), nullable=False)
    name: Mapped[str] = mapped_column(String)
    description: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    coach: Mapped["Coach"] = relationship("app.modules.identity.models.Coach", back_populates="groups")
    group_athletes: Mapped[list["GroupAthlete"]] = relationship(back_populates="group", cascade="all, delete-orphan")


class GroupAthlete(Base):
    __tablename__ = "group_athletes"

    group_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("groups.id"), primary_key=True)
    athlete_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("athletes.id"), primary_key=True)
    joined_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    group: Mapped["Group"] = relationship(back_populates="group_athletes")
    athlete: Mapped["Athlete"] = relationship("app.modules.identity.models.Athlete", back_populates="athlete_groups")
