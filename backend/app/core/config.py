from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    APP_NAME: str = "FlowOps API"
    ENV : str = "development"

    DATABASE_URL : str = "postgresql://postgres:postgres@localhost:5432/flowops"
    REDIS_URL : str = "redis://localhost:6379/0"
    SECRET_KEY : str = "DBbL9pREF=PGvV#Cu=,Sccb}*BQXB:*sctM:GvImNCp"
    ALGORITHM : str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES : int = 30
    STRIPE_API_KEY: str = "sk_test_..."
    STRIPE_WEBHOOK_SECRET: str = "whsec_..."
    DOMAIN: str = "http://localhost:3000"
    OPENAI_API_KEY: Optional[str] = None

    model_config = SettingsConfigDict(
        env_file="../.env",
        extra="ignore"
    )

settings = Settings()