"""
Configuración central de la aplicación usando pydantic-settings.
Lee automáticamente las variables desde el archivo .env
"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # ── Aplicación ───────────────────────────────────────────
    APP_NAME: str = "Jesus Obrero API"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = False

    # ── Base de datos ────────────────────────────────────────
    DATABASE_URL: str

    # ── JWT ──────────────────────────────────────────────────
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # ── CORS ─────────────────────────────────────────────────
    ALLOWED_ORIGINS: list[str] = ["http://localhost:5173"]

    # ── Storage ──────────────────────────────────────────────
    UPLOAD_DIR: str = "app/uploads"
    MAX_UPLOAD_SIZE_MB: int = 10


# Instancia única compartida en toda la aplicación
settings = Settings()
