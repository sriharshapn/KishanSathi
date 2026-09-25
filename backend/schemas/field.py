from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class FieldCreate(BaseModel):
    name: str
    area_hectares: float = 1.0
    latitude: float
    longitude: float
    boundary_geojson: Optional[dict] = None
    soil_type: Optional[str] = None
    current_crop: Optional[str] = None


class FieldUpdate(BaseModel):
    current_crop: Optional[str] = None
    soil_type: Optional[str] = None
    area_hectares: Optional[float] = None
    name: Optional[str] = None


class FieldResponse(BaseModel):
    id: uuid.UUID
    farmer_id: uuid.UUID
    name: str
    area_hectares: float
    latitude: float
    longitude: float
    soil_type: Optional[str]
    current_crop: Optional[str]
    ndvi_latest: Optional[float]
    ndvi_health: Optional[str]
    ndvi_updated_at: Optional[datetime]
    created_at: datetime

    model_config = {"from_attributes": True}
