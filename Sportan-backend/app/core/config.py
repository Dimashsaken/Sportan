from pydantic import AliasChoices, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DATABASE_URL: str
    SUPABASE_URL: str
    SUPABASE_KEY: str
    SUPABASE_SERVICE_KEY: str
    SUPABASE_JWKS_URL: str
    AI_API_KEY: str = Field(validation_alias=AliasChoices("AI_API_KEY", "GEMINI_API_KEY"))
    AI_BASE_URL: str = "https://generativelanguage.googleapis.com/v1beta/openai/"
    AI_DEFAULT_MODEL: str = "gemini-2.5-flash"
    SYSTEM_CRON_TOKEN: str
    PROJECT_NAME: str = "Sportan Backend"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
