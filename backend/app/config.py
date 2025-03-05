"""
Configuration settings for the application.

This module contains configuration settings for the backend application,
including environment variables, API keys, and CORS settings.
"""

import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Settings(BaseSettings):
    """Application settings."""
    
    # API settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Secure IaC"
    
    # CORS settings
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",  # Frontend development server
        "http://frontend:3000",   # Frontend Docker container
    ]
    
    # Anthropic API settings
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
    
    class Config:
        env_file = ".env"
        case_sensitive = True

# Create settings instance
settings = Settings()