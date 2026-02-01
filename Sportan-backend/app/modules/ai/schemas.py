from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class ReportRead(BaseModel):
    id: UUID
    athlete_id: UUID
    report_text: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
