from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.modules.coaching import schemas as coaching_schemas
from app.modules.coaching import service as coaching_service
from app.modules.identity import models as identity_models
from app.modules.identity import schemas as identity_schemas
from app.modules.identity import service as identity_service
from app.modules.training import schemas as training_schemas
from app.modules.training import service as training_service

router = APIRouter(prefix="/coach", tags=["coaching"])

CoachDep = Annotated[identity_models.Coach, Depends(identity_service.get_current_coach)]
DbDep = Annotated[AsyncSession, Depends(get_db)]


# --- Groups ---
@router.post("/groups", response_model=coaching_schemas.GroupRead)
async def create_group(data: coaching_schemas.GroupCreate, coach: CoachDep, db: DbDep):
    return await coaching_service.create_group(db, coach.id, data)


@router.get("/groups", response_model=list[coaching_schemas.GroupRead])
async def get_groups(coach: CoachDep, db: DbDep):
    return await coaching_service.get_coach_groups(db, coach.id)


@router.get("/groups/{group_id}", response_model=coaching_schemas.GroupRead)
async def get_group(group_id: UUID, coach: CoachDep, db: DbDep):
    return await coaching_service.get_group_by_id(db, group_id, coach.id)


@router.put("/groups/{group_id}", response_model=coaching_schemas.GroupRead)
async def update_group(group_id: UUID, data: coaching_schemas.GroupUpdate, coach: CoachDep, db: DbDep):
    return await coaching_service.update_group(db, group_id, coach.id, data)


@router.delete("/groups/{group_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_group(group_id: UUID, coach: CoachDep, db: DbDep):
    await coaching_service.delete_group(db, group_id, coach.id)


# --- Membership ---
@router.get("/groups/{group_id}/athletes", response_model=list[identity_schemas.AthleteRead])
async def get_group_athletes(group_id: UUID, coach: CoachDep, db: DbDep):
    return await coaching_service.get_group_athletes(db, group_id, coach.id)


@router.post("/groups/{group_id}/athletes", response_model=identity_schemas.AthleteRead)
async def create_athlete_in_group(group_id: UUID, data: coaching_schemas.AthleteCreate, coach: CoachDep, db: DbDep):
    return await coaching_service.create_athlete(db, coach.id, group_id, data)


@router.post("/groups/{group_id}/athletes/{athlete_id}")
async def add_existing_athlete(group_id: UUID, athlete_id: UUID, coach: CoachDep, db: DbDep):
    await coaching_service.add_athlete_to_group(db, group_id, athlete_id, coach.id)
    return {"message": "Athlete added"}


@router.delete("/groups/{group_id}/athletes/{athlete_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_athlete(group_id: UUID, athlete_id: UUID, coach: CoachDep, db: DbDep):
    await coaching_service.remove_athlete_from_group(db, group_id, athlete_id, coach.id)


# --- Athletes (Coach View) ---
@router.get("/athletes/{athlete_id}", response_model=identity_schemas.AthleteRead)
async def get_athlete(athlete_id: UUID, coach: CoachDep, db: DbDep):
    return await coaching_service.get_athlete(db, athlete_id, coach.id)


@router.get("/athletes/{athlete_id}/summary", response_model=training_schemas.AthleteSummary)
async def get_athlete_summary(athlete_id: UUID, coach: CoachDep, db: DbDep):
    # Verify ownership
    await coaching_service.get_athlete(db, athlete_id, coach.id)
    return await training_service.get_athlete_summary(db, athlete_id)


@router.put("/athletes/{athlete_id}", response_model=identity_schemas.AthleteRead)
async def update_athlete(athlete_id: UUID, data: coaching_schemas.AthleteUpdate, coach: CoachDep, db: DbDep):
    return await coaching_service.update_athlete(db, athlete_id, coach.id, data)


@router.delete("/athletes/{athlete_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_athlete(athlete_id: UUID, coach: CoachDep, db: DbDep):
    await coaching_service.delete_athlete(db, athlete_id, coach.id)


# --- Parents ---
@router.post("/parents", response_model=identity_schemas.ParentRead)
async def create_parent(data: coaching_schemas.ParentCreate, coach: CoachDep, db: DbDep):
    return await coaching_service.create_parent(db, coach.id, data)


@router.get("/parents/{parent_id}", response_model=identity_schemas.ParentRead)
async def get_parent(parent_id: UUID, coach: CoachDep, db: DbDep):
    return await coaching_service.get_parent(db, parent_id)


@router.put("/parents/{parent_id}", response_model=identity_schemas.ParentRead)
async def update_parent(parent_id: UUID, data: coaching_schemas.ParentUpdate, coach: CoachDep, db: DbDep):
    return await coaching_service.update_parent(db, parent_id, data)


@router.delete("/parents/{parent_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_parent(parent_id: UUID, coach: CoachDep, db: DbDep):
    await coaching_service.delete_parent(db, parent_id)


@router.get("/athletes/{athlete_id}/parent", response_model=identity_schemas.ParentRead)
async def get_athlete_parent(athlete_id: UUID, coach: CoachDep, db: DbDep):
    parent = await coaching_service.get_athlete_parent(db, athlete_id, coach.id)
    if not parent:
        raise HTTPException(status_code=404, detail="No parent linked")
    return parent
