from typing import Annotated
from uuid import UUID

from fastapi import Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import get_token_payload
from app.core.database import get_db
from app.modules.identity import models


async def get_current_user(
    token_payload: Annotated[dict, Depends(get_token_payload)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """
    Resolves the current user based on the JWT token payload.
    The JWT is expected to have a 'sub' (user_id) and a role.
    """
    user_id_str = token_payload.get("sub")
    if not user_id_str:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token: missing sub")

    try:
        user_id = UUID(user_id_str)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token: sub is not a valid UUID",
        ) from None

    # Extract role. Supabase stores custom roles in app_metadata usually,
    # but we'll check a few places to be safe or adhere to the specific setup.
    app_metadata = token_payload.get("app_metadata", {})
    user_metadata = token_payload.get("user_metadata", {})

    # Priority: app_metadata['role'] -> user_metadata['role'] -> 'role' claim
    role = app_metadata.get("role") or user_metadata.get("role") or token_payload.get("role")

    if not role:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User role not found in token")

    if role == "coach":
        result = await db.execute(select(models.Coach).where(models.Coach.id == user_id))
        user = result.scalars().first()
        if not user:
            # Optional: Auto-create coach if they don't exist but have the role?
            # For now, we assume they must exist or we return 404/401.
            # But since Coach signup flow might be just Supabase Signup,
            # we might want to create the profile here.
            # Let's stick to strict retrieval for now as per spec "Resolves...".
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Coach profile not found")
        return user

    elif role == "athlete":
        result = await db.execute(select(models.Athlete).where(models.Athlete.id == user_id))
        user = result.scalars().first()
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Athlete profile not found")
        return user

    elif role == "parent":
        result = await db.execute(select(models.Parent).where(models.Parent.id == user_id))
        user = result.scalars().first()
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Parent profile not found")
        return user

    else:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=f"Unknown role: {role}")


async def get_current_coach(
    user: Annotated[models.Coach | models.Athlete | models.Parent, Depends(get_current_user)],
) -> models.Coach:
    if not isinstance(user, models.Coach):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized as Coach")
    return user


async def get_current_athlete(
    user: Annotated[models.Coach | models.Athlete | models.Parent, Depends(get_current_user)],
) -> models.Athlete:
    if not isinstance(user, models.Athlete):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized as Athlete")
    return user


async def get_current_parent(
    user: Annotated[models.Coach | models.Athlete | models.Parent, Depends(get_current_user)],
) -> models.Parent:
    if not isinstance(user, models.Parent):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized as Parent")
    return user
