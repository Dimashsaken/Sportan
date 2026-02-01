from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.modules.identity import models, schemas, service

router = APIRouter(tags=["identity"])


@router.get("/coach/me", response_model=schemas.CoachRead)
async def get_coach_me(current_coach: Annotated[models.Coach, Depends(service.get_current_coach)]):
    return current_coach


@router.get("/athlete/me", response_model=schemas.AthleteRead)
async def get_athlete_me(current_athlete: Annotated[models.Athlete, Depends(service.get_current_athlete)]):
    return current_athlete


@router.get("/parent/me", response_model=schemas.ParentRead)
async def get_parent_me(current_parent: Annotated[models.Parent, Depends(service.get_current_parent)]):
    return current_parent


@router.get("/parent/athlete", response_model=schemas.AthleteRead)
async def get_parent_child(
    current_parent: Annotated[models.Parent, Depends(service.get_current_parent)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    # We need to fetch the athlete. Parent model has athlete_id.
    # Since we didn't eager load in get_current_user, we fetch here.
    result = await db.execute(select(models.Athlete).where(models.Athlete.id == current_parent.athlete_id))
    athlete = result.scalars().first()

    if not athlete:
        raise HTTPException(status_code=404, detail="Linked athlete not found")

    return athlete
