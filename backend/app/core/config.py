from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "FlowOps API"
    ENV : str = "development"

    DATABASE_URL : str = "postgresql://postgres:postgres@localhost:5432/flowops"
    REDIS_URL : str = "redis://localhost:6379/0"
    SECRET_KEY : str = "DBbL9pREF=PGvV#Cu=,Sccb}*BQXB:*sctM:GvImNCp"
    ALGORITHM : str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES : int = 30

    class Config:
        env_file = ".env"

settings = Settings()