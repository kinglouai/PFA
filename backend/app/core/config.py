"""
Application configuration — loads environment variables via pydantic BaseSettings.
"""

from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from .env file."""

    # GitHub OAuth
    GITHUB_CLIENT_ID: str = ""
    GITHUB_CLIENT_SECRET: str = ""
    GITHUB_REDIRECT_URI: str = "http://localhost:8000/api/v1/auth/callback"

    # App secrets
    SECRET_KEY: str = "dev-secret-key"

    # CORS
    FRONTEND_URL: str = "http://localhost:3000"

    # GitHub API token (optional, for higher rate limits on public repos)
    GITHUB_TOKEN: Optional[str] = None

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
    }


settings = Settings()
