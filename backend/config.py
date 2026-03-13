from pydantic_settings import BaseSettings
from dotenv import load_dotenv
import os

load_dotenv()

class Settings(BaseSettings):
    POSTGRES_USER: str = os.getenv("POSTGRES_USER")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD")
    POSTGRES_HOST: str = os.getenv("POSTGRES_HOST")
    POSTGRES_PORT: int = os.getenv("POSTGRES_PORT")
    POSTGRES_DB: str = os.getenv("POSTGRES_DB")
    SECRET_KEY: str = os.getenv("SECRET_KEY")
    ALGORITHM: str = os.getenv("ALGORITHM")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES")
    JWKS_URL: str = os.getenv("JWKS")
    ALGORITHM: str = os.getenv("ALGORITHM")
    CLERK_SECRET_KEY: str = os.getenv("CLERK_SECRET_KEY")
    STRIPE_SECRET_KEY: str = os.getenv("STRIPE_SECRET_KEY")
    # REFRESH_TOKEN_EXPIRE_MINUTES: int = os.getenv("REFRESH_TOKEN_EXPIRE_MINUTES")
    # EMAIL_HOST: str = os.getenv("EMAIL_HOST")
    # EMAIL_PORT: int = os.getenv("EMAIL_PORT")
    # EMAIL_HOST_USER: str = os.getenv("EMAIL_HOST_USER")
    # EMAIL_HOST_PASSWORD: str = os.getenv("EMAIL_HOST_PASSWORD")

    @property
    def database_url(self):
        return f"postgresql+asyncpg://reminapp_database_user:0NZk0NKkjY6WMQZi2xMQVTTmaYAGd9Q7@dpg-d454jp15pdvs73c5fftg-a.oregon-postgres.render.com/reminapp_database"
settings = Settings()