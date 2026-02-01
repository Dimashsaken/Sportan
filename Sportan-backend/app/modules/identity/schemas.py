from __future__ import annotations

from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr


class UserBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)


# --- Coach Schemas ---
class CoachRead(UserBase):
    id: UUID
    email: EmailStr
    full_name: str
    created_at: datetime


# --- Athlete Schemas ---
class AthleteRead(UserBase):
    id: UUID
    coach_id: UUID
    full_name: str
    dob: date | None
    notes: str | None
    created_at: datetime


# --- Parent Schemas ---
class ParentRead(UserBase):
    id: UUID
    athlete_id: UUID
    email: EmailStr
    full_name: str
    phone: str | None
    created_at: datetime


# --- Token Schema ---
class TokenData(BaseModel):
    id: UUID
    email: str | None = None
    role: str
