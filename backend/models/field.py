from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, Float, ForeignKey, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from database import Base

# Try to import GeoAlchemy2 Geometry; fall back to plain Text if PostGIS unavailable
try:
    from geoalchemy2 import Geometry

    _geometry_type = Geometry("POLYGON", srid=4326)
    _has_postgis = True
except Exception:
    from sqlalchemy import Text

    _geometry_type = None
    _has_postgis = False


class Field(Base):
    __tablename__ = "fields"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    farmer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("farmers.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    area_hectares: Mapped[float] = mapped_column(Float, nullable=False, default=1.0)

    # Store boundary as WKT text for broad compatibility
    boundary: Mapped[Optional[str]] = mapped_column(String(2000), nullable=True)

    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    soil_type: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    current_crop: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    # NDVI fields updated by satellite service
    ndvi_latest: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    ndvi_health: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    ndvi_updated_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
