from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class AdvisoryRequest(BaseModel):
    language: str = "English"


class AdvisoryResponse(BaseModel):
    id: uuid.UUID
    field_id: uuid.UUID
    advisory_json: dict
    weather_summary: Optional[str]
    ndvi_score: Optional[float]
    language: str
    created_at: datetime

    model_config = {"from_attributes": True}
