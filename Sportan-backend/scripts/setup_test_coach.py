#!/usr/bin/env python3
"""
Setup test user as a coach in the database.
"""

import asyncio
import sys
from pathlib import Path
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

project_root = Path(__file__).parent.parent

# Ensure app modules are importable
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))


def load_app_modules():
    from app.core.config import settings as cfg
    from app.modules.identity.models import Coach as CoachModel

    return cfg, CoachModel


settings, Coach = load_app_modules()

# Test user ID from Supabase
TEST_USER_ID = "b9b7165d-b7bc-48d4-95ec-9623829ca836"
TEST_EMAIL = "askhat.ss23+test@gmail.com"


async def setup_coach():
    """Create coach profile for test user."""
    print("=" * 60)
    print("Setting up Test Coach")
    print("=" * 60)
    print(f"User ID: {TEST_USER_ID}")
    print(f"Email: {TEST_EMAIL}\n")

    # Create async engine
    engine = create_async_engine(settings.DATABASE_URL, echo=True)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        # Check if coach already exists
        result = await session.execute(select(Coach).where(Coach.id == UUID(TEST_USER_ID)))
        existing_coach = result.scalars().first()

        if existing_coach:
            print(f"[OK] Coach profile already exists: {existing_coach.name}")
            return

        # Create new coach
        coach = Coach(
            id=UUID(TEST_USER_ID),
            email=TEST_EMAIL,
            name="Test Coach",
        )

        session.add(coach)
        await session.commit()
        await session.refresh(coach)

        print(f"[OK] Created coach profile: {coach.name}")
        print(f"[OK] Coach ID: {coach.id}")

    await engine.dispose()


if __name__ == "__main__":
    try:
        asyncio.run(setup_coach())
        print("\n" + "=" * 60)
        print("[SUCCESS] Test coach setup complete!")
        print("=" * 60)
        print("\nYou can now update the user's role in Supabase:")
        print("1. Go to Supabase Dashboard > Authentication > Users")
        print("2. Find user: askhat.ss23+test@gmail.com")
        print("3. Click 'Edit user'")
        print('4. In Raw user meta data, add: {"role": "coach"}')
        print("5. Save")
        print("\nOR use the Supabase SQL Editor:")
        print("UPDATE auth.users")
        print('SET raw_app_meta_data = raw_app_meta_data || \'{"role": "coach"}\'::jsonb')
        print(f"WHERE id = '{TEST_USER_ID}';")
    except Exception as e:
        print(f"\n[ERROR] {e}")
        sys.exit(1)
