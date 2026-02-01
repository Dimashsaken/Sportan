from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr


# --- Group Schemas ---
class GroupBase(BaseModel):
    name: str
    description: str | None = None


class GroupCreate(GroupBase):
    pass


class GroupUpdate(GroupBase):
    name: str | None = None
    description: str | None = None


class GroupRead(GroupBase):
    id: UUID
    coach_id: UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# --- Athlete Management Schemas ---
class AthleteCreate(BaseModel):
    full_name: str
    dob: date | None = None
    notes: str | None = None


class AthleteUpdate(BaseModel):
    full_name: str | None = None
    dob: date | None = None
    notes: str | None = None


# --- Parent Management Schemas ---
class ParentCreate(BaseModel):
    full_name: str
    email: EmailStr
    athlete_id: UUID


class ParentUpdate(BaseModel):
    full_name: str | None = None
    email: EmailStr | None = None
    phone: str | None = None
