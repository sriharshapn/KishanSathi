from __future__ import annotations

import json
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(".env", "../.env"),
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    DATABASE_URL: str = "postgresql+asyncpg://agrimate:agrimate@localhost:5432/agrimate"
    GEMINI_API_KEY: str = ""
    EE_PROJECT: str = ""
    JWT_SECRET: str = ""
    JWT_ALGORITHM: str = "HS256"
    CORS_ORIGINS: str = '["http://localhost:3000", "http://localhost:5173"]'
    UPLOAD_DIR: str = "uploads"
    ENVIRONMENT: str = "development"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    def get_cors_origins(self) -> List[str]:
        try:
            return json.loads(self.CORS_ORIGINS)
        except Exception:
            return ["*"]


settings = Settings()
