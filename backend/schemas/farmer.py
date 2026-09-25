from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, field_validator


class FarmerCreate(BaseModel):
    mobile: str
    name: str
    state: str
    district: str
    language: str = "en"
    password: str

    @field_validator("mobile")
    @classmethod
    def mobile_must_be_digits(cls, v: str) -> str:
        digits = v.strip().replace("+", "").replace("-", "").replace(" ", "")
        if not digits.isdigit():
            raise ValueError("Mobile must contain only digits")
        return v.strip()


class FarmerResponse(BaseModel):
    id: uuid.UUID
    mobile: str
    name: str
    state: str
    district: str
    language: str
    created_at: datetime

    model_config = {"from_attributes": True}


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    farmer: FarmerResponse


class LoginRequest(BaseModel):
    mobile: str
    password: str
