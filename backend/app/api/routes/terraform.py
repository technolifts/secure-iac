"""
Terraform API routes.

This module contains API endpoints for generating Terraform code.
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import Optional

from app.models.terraform import S3FormData, TerraformResponse
from app.services.ai_service import AIService
from app.services.terraform_service import TerraformService

router = APIRouter()

# Dependency injection for services
def get_ai_service():
    return AIService()

def get_terraform_service():
    return TerraformService()

@router.post("/generate/s3", response_model=TerraformResponse)
async def generate_s3_terraform(
    form_data: S3FormData,
    ai_service: AIService = Depends(get_ai_service),
    terraform_service: TerraformService = Depends(get_terraform_service)
):
    """
    Generate secure Terraform code for an S3 bucket.
    
    Takes form data with S3 bucket requirements and returns Terraform code.
    """
    try:
        # Generate Terraform code
        terraform_code = await ai_service.generate_terraform_for_s3(form_data)
        
        # Process the terraform code
        processed_code = terraform_service.process_terraform(terraform_code, "s3")
        
        return {"terraform_code": processed_code}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate Terraform: {str(e)}")