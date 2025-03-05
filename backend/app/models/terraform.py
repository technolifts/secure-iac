"""
Data models for Terraform generation.

This module contains Pydantic models for request/response data validation.
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Literal


class S3FormData(BaseModel):
    """S3 bucket form data model."""
    
    use_case: str = Field(..., min_length=1, description="Description of what the S3 bucket will be used for")
    access_control: Literal["bucket_owner", "authenticated_users", "object_owner_control"] = Field(
        ..., description="Who needs access to the bucket"
    )
    compliance_framework: Optional[List[Literal["hipaa", "pci_dss"]]] = Field(
        None, description="Compliance frameworks to follow"
    )
    public_access: bool = Field(
        False, description="Whether the bucket needs to be accessible to the internet"
    )
    bucket_name: str = Field(..., min_length=3, description="Name of the S3 bucket")
    region: str = Field(..., description="AWS region for the bucket")


class TerraformResponse(BaseModel):
    """Terraform code response model."""
    
    terraform_code: str = Field(..., description="Generated Terraform code")