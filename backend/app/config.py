from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    openai_api_key: str
    secret_key: str = "change-me"
    database_url: str = "sqlite:///./policy_sim.db"
    celery_broker_url: str = "redis://localhost:6379/0"
    celery_result_backend: str = "redis://localhost:6379/0"
    seed_email: str = "admin@cmhc.ca"
    seed_password: str = "password"

    class Config:
        env_file = ".env"


settings = Settings()
