import uuid

from fastapi import HTTPException
from sqlalchemy import delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from supabase_auth.errors import AuthApiError

from app.core.supabase import get_supabase_admin_client
from app.modules.coaching import models as coaching_models
from app.modules.coaching import schemas as coaching_schemas
from app.modules.identity import models as identity_models

# --- Group Operations ---


async def create_group(
    db: AsyncSession, coach_id: uuid.UUID, group_data: coaching_schemas.GroupCreate
) -> coaching_models.Group:
    group = coaching_models.Group(coach_id=coach_id, name=group_data.name, description=group_data.description)
    db.add(group)
    await db.commit()
    await db.refresh(group)
    return group


async def get_coach_groups(db: AsyncSession, coach_id: uuid.UUID) -> list[coaching_models.Group]:
    result = await db.execute(select(coaching_models.Group).where(coaching_models.Group.coach_id == coach_id))
    return list(result.scalars().all())


async def get_group_by_id(db: AsyncSession, group_id: uuid.UUID, coach_id: uuid.UUID) -> coaching_models.Group:
    result = await db.execute(
        select(coaching_models.Group).where(
            coaching_models.Group.id == group_id, coaching_models.Group.coach_id == coach_id
        )
    )
    group = result.scalars().first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    return group


async def update_group(
    db: AsyncSession, group_id: uuid.UUID, coach_id: uuid.UUID, group_data: coaching_schemas.GroupUpdate
) -> coaching_models.Group:
    group = await get_group_by_id(db, group_id, coach_id)

    if group_data.name is not None:
        group.name = group_data.name
    if group_data.description is not None:
        group.description = group_data.description

    await db.commit()
    await db.refresh(group)
    return group


async def delete_group(db: AsyncSession, group_id: uuid.UUID, coach_id: uuid.UUID):
    # 1. Verify ownership
    group = await get_group_by_id(db, group_id, coach_id)

    # 2. Identify athletes to cascade delete (those who are ONLY in this group)
    # Get all athletes in this group
    result = await db.execute(
        select(coaching_models.GroupAthlete.athlete_id).where(coaching_models.GroupAthlete.group_id == group_id)
    )
    athlete_ids = result.scalars().all()

    athletes_to_delete = []
    for aid in athlete_ids:
        # Check count of groups for this athlete
        count_res = await db.execute(
            select(func.count(coaching_models.GroupAthlete.group_id)).where(
                coaching_models.GroupAthlete.athlete_id == aid
            )
        )
        count = count_res.scalar()
        if count <= 1:  # It's 1 (this group) or 0 (shouldn't happen)
            athletes_to_delete.append(aid)

    # 3. Delete the group (this will cascade delete GroupAthlete records for this group)
    await db.delete(group)

    # 4. Delete the identified athletes
    if athletes_to_delete:
        await db.execute(delete(identity_models.Athlete).where(identity_models.Athlete.id.in_(athletes_to_delete)))
        # Note: Parent deletion should cascade from Athlete if configured in DB or models.
        # In identity/models.py: parent: relationship(..., cascade="all, delete-orphan")
        # So deleting Athlete deletes Parent. Supabase User for parent is NOT deleted here automatically.
        # We might want to handle Supabase User deletion, but that requires Parent -> Auth ID mapping.
        # Assuming we leave Supabase User for now or handle it if we had the ID.

    await db.commit()


# --- Membership Operations ---


async def get_group_athletes(
    db: AsyncSession, group_id: uuid.UUID, coach_id: uuid.UUID
) -> list[identity_models.Athlete]:
    await get_group_by_id(db, group_id, coach_id)

    # Fetch athletes joined with this group
    # Using GroupAthlete association
    query = (
        select(identity_models.Athlete)
        .join(coaching_models.GroupAthlete, identity_models.Athlete.id == coaching_models.GroupAthlete.athlete_id)
        .where(coaching_models.GroupAthlete.group_id == group_id)
    )
    result = await db.execute(query)
    return list(result.scalars().all())


async def add_athlete_to_group(db: AsyncSession, group_id: uuid.UUID, athlete_id: uuid.UUID, coach_id: uuid.UUID):
    # Verify group ownership
    await get_group_by_id(db, group_id, coach_id)

    # Verify athlete ownership (must belong to same coach)
    athlete_res = await db.execute(
        select(identity_models.Athlete).where(
            identity_models.Athlete.id == athlete_id, identity_models.Athlete.coach_id == coach_id
        )
    )
    athlete = athlete_res.scalars().first()
    if not athlete:
        raise HTTPException(status_code=404, detail="Athlete not found or does not belong to you")

    # Check if already in group
    exists_res = await db.execute(
        select(coaching_models.GroupAthlete).where(
            coaching_models.GroupAthlete.group_id == group_id, coaching_models.GroupAthlete.athlete_id == athlete_id
        )
    )
    if exists_res.scalars().first():
        raise HTTPException(status_code=400, detail="Athlete already in this group")

    # Add
    membership = coaching_models.GroupAthlete(group_id=group_id, athlete_id=athlete_id)
    db.add(membership)
    await db.commit()


async def remove_athlete_from_group(db: AsyncSession, group_id: uuid.UUID, athlete_id: uuid.UUID, coach_id: uuid.UUID):
    await get_group_by_id(db, group_id, coach_id)

    # Check membership
    membership_res = await db.execute(
        select(coaching_models.GroupAthlete).where(
            coaching_models.GroupAthlete.group_id == group_id, coaching_models.GroupAthlete.athlete_id == athlete_id
        )
    )
    membership = membership_res.scalars().first()
    if not membership:
        raise HTTPException(status_code=404, detail="Athlete not in this group")

    # Check floating athlete rule
    # Count how many groups this athlete is in
    count_res = await db.execute(
        select(func.count(coaching_models.GroupAthlete.group_id)).where(
            coaching_models.GroupAthlete.athlete_id == athlete_id
        )
    )
    count = count_res.scalar()

    if count <= 1:
        raise HTTPException(
            status_code=400, detail="Cannot remove athlete from their last group. Delete the athlete profile instead."
        )

    await db.delete(membership)
    await db.commit()


# --- Athlete Operations ---


async def create_athlete(
    db: AsyncSession, coach_id: uuid.UUID, group_id: uuid.UUID, data: coaching_schemas.AthleteCreate
) -> identity_models.Athlete:
    # Verify group first
    await get_group_by_id(db, group_id, coach_id)

    # Create Athlete
    athlete = identity_models.Athlete(coach_id=coach_id, full_name=data.full_name, dob=data.dob, notes=data.notes)
    db.add(athlete)
    await db.flush()  # get ID

    # Add to Group
    membership = coaching_models.GroupAthlete(group_id=group_id, athlete_id=athlete.id)
    db.add(membership)

    await db.commit()
    await db.refresh(athlete)
    return athlete


async def get_athlete(db: AsyncSession, athlete_id: uuid.UUID, coach_id: uuid.UUID) -> identity_models.Athlete:
    result = await db.execute(
        select(identity_models.Athlete).where(
            identity_models.Athlete.id == athlete_id, identity_models.Athlete.coach_id == coach_id
        )
    )
    athlete = result.scalars().first()
    if not athlete:
        raise HTTPException(status_code=404, detail="Athlete not found")
    return athlete


async def update_athlete(
    db: AsyncSession, athlete_id: uuid.UUID, coach_id: uuid.UUID, data: coaching_schemas.AthleteUpdate
) -> identity_models.Athlete:
    athlete = await get_athlete(db, athlete_id, coach_id)

    if data.full_name is not None:
        athlete.full_name = data.full_name
    if data.dob is not None:
        athlete.dob = data.dob
    if data.notes is not None:
        athlete.notes = data.notes

    await db.commit()
    await db.refresh(athlete)
    return athlete


async def delete_athlete(db: AsyncSession, athlete_id: uuid.UUID, coach_id: uuid.UUID):
    athlete = await get_athlete(db, athlete_id, coach_id)
    # Deleting athlete should cascade to GroupAthlete, Workouts, etc.
    await db.delete(athlete)
    await db.commit()


# --- Parent Operations ---


async def create_parent(
    db: AsyncSession, coach_id: uuid.UUID, data: coaching_schemas.ParentCreate
) -> identity_models.Parent:
    # Verify athlete belongs to coach
    await get_athlete(db, data.athlete_id, coach_id)

    # Check if athlete already has a parent
    # (Assuming 1 parent per athlete for now as per description "linked to exactly one child")
    # Check if parent exists for this athlete?
    # Parent table has athlete_id unique=True.
    # So we just try to create.

    # Create Supabase User
    supabase_admin = get_supabase_admin_client()
    try:
        user_payload = {
            "email": data.email,
            "password": "ChangeMe123!",  # Temporary password
            "email_confirm": True,
            "user_metadata": {"role": "parent"},
            "app_metadata": {"role": "parent"},
        }
        auth_response = supabase_admin.auth.admin.create_user(user_payload)
        auth_user = auth_response.user
        if not auth_user:
            raise HTTPException(status_code=502, detail="Failed to create auth user")

        auth_id = uuid.UUID(auth_user.id)
    except AuthApiError as e:
        raise HTTPException(status_code=502, detail=f"Failed to create auth user: {e.message}") from e
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Failed to create auth user: {str(e)}") from e

    # Create Parent Record
    # Use auth_id as the ID to link them?
    parent = identity_models.Parent(
        id=auth_id,  # Force ID to match Supabase ID
        athlete_id=data.athlete_id,
        email=data.email,
        full_name=data.full_name,
    )

    db.add(parent)
    try:
        await db.commit()
        await db.refresh(parent)
    except Exception as e:
        # Rollback Supabase user?
        # supabase.auth.admin.delete_user(auth_user.id)
        raise HTTPException(status_code=400, detail=f"Database error: {str(e)}") from e

    return parent


async def get_parent(db: AsyncSession, parent_id: uuid.UUID) -> identity_models.Parent:
    result = await db.execute(select(identity_models.Parent).where(identity_models.Parent.id == parent_id))
    parent = result.scalars().first()
    if not parent:
        raise HTTPException(status_code=404, detail="Parent not found")
    return parent


async def update_parent(
    db: AsyncSession, parent_id: uuid.UUID, data: coaching_schemas.ParentUpdate
) -> identity_models.Parent:
    parent = await get_parent(db, parent_id)

    if data.full_name is not None:
        parent.full_name = data.full_name
    if data.email is not None:
        parent.email = data.email
    if data.phone is not None:
        parent.phone = data.phone

    await db.commit()
    await db.refresh(parent)
    return parent


async def delete_parent(db: AsyncSession, parent_id: uuid.UUID):
    parent = await get_parent(db, parent_id)
    # Also delete Supabase user?
    supabase = get_supabase_admin_client()
    try:
        supabase.auth.admin.delete_user(str(parent_id))
    except Exception:
        # Log warning but proceed to delete from DB
        pass

    await db.delete(parent)
    await db.commit()


async def get_athlete_parent(
    db: AsyncSession, athlete_id: uuid.UUID, coach_id: uuid.UUID
) -> identity_models.Parent | None:
    # Verify athlete
    await get_athlete(db, athlete_id, coach_id)

    result = await db.execute(select(identity_models.Parent).where(identity_models.Parent.athlete_id == athlete_id))
    return result.scalars().first()
