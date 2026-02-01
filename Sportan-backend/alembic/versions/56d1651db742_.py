"""empty message

Revision ID: 56d1651db742
Revises:
Create Date: 2025-11-30 17:43:03.069325

"""

from collections.abc import Sequence

# revision identifiers, used by Alembic.
revision: str = "56d1651db742"
down_revision: str | Sequence[str] | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
