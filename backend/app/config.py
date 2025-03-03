import os
from pydantic import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Secure IaC"
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "development_key")
    
    # AI Service Config
    AI_SERVICE_API_KEY: str = os.getenv("AI_SERVICE_API_KEY", "")
    AI_SERVICE_URL: str = os.getenv("AI_SERVICE_URL", "")
    
    # CORS
    CORS_ORIGINS: list = [
        "http://localhost:3000",
        "http://localhost:8000",
    ]
    
    class Config:
        case_sensitive = True

settings = Settings()