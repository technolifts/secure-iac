from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, Field, validator
from typing import Dict, Any, List, Optional
from enum import Enum

from app.services.ai_service import AIService
from app.services.terraform_service import TerraformService
from app.services.scanner_service import ScannerService

router = APIRouter(tags=["templates"])

# Enums for template generation
class ServiceType(str, Enum):
    s3 = "s3"
    ec2 = "ec2"
    vpc = "vpc"

class EncryptionType(str, Enum):
    AES256 = "AES256"
    KMS = "aws:kms"

class AccessControl(str, Enum):
    PRIVATE = "private"
    AUTHENTICATED_READ = "authenticated-read"
    BUCKET_OWNER_READ = "bucket-owner-read"

# S3 Request Model
class S3Request(BaseModel):
    bucket_name: str = Field(..., min_length=3, max_length=63)
    region: str
    access_control: AccessControl = AccessControl.PRIVATE
    encryption: EncryptionType = EncryptionType.AES256
    versioning_enabled: bool = True
    logging_enabled: bool = True
    public_access_enabled: bool = False
    lifecycle_rules: Optional[str] = "none"
    cors_enabled: bool = False
    allowed_origins: Optional[str] = None
    compliance_type: str = "standard"
    
    @validator('bucket_name')
    def validate_bucket_name(cls, v):
        import re
        if not re.match(r'^[a-z0-9.-]{3,63}$', v):
            raise ValueError('Bucket name must be between 3 and 63 characters and can only contain lowercase letters, numbers, periods, and hyphens')
        return v
    
    @validator('allowed_origins')
    def validate_allowed_origins(cls, v, values):
        if values.get('cors_enabled', False) and not v:
            raise ValueError('Allowed origins are required when CORS is enabled')
        return v

# EC2 Request Model
class EC2Request(BaseModel):
    instance_name: str
    region: str
    instance_type: str
    ami_id: str
    vpc_id: str = "default"
    subnet_id: str = "default"
    key_pair_name: Optional[str] = None
    associate_public_ip: bool = False
    ebs_encryption: bool = True
    ebs_volume_size: int = Field(20, ge=8)
    backup_enabled: bool = True
    cloud_watch_monitoring: str = "basic"
    security_level: str = "high"
    auto_scaling: bool = False
    min_instances: Optional[int] = 1
    max_instances: Optional[int] = 3
    user_data: Optional[str] = None
    
    @validator('min_instances', 'max_instances')
    def validate_scaling_instances(cls, v, values):
        if values.get('auto_scaling', False):
            if v is None:
                raise ValueError('Instance count is required when auto scaling is enabled')
        return v

# VPC Request Model
class VPCRequest(BaseModel):
    vpc_name: str
    region: str
    cidr_block: str = "10.0.0.0/16"
    enable_dns_support: bool = True
    enable_dns_hostnames: bool = True
    num_public_subnets: int = Field(2, ge=0, le=6)
    num_private_subnets: int = Field(2, ge=0, le=6)
    enable_nat_gateway: bool = True
    single_nat_gateway: bool = False
    enable_vpn_gateway: bool = False
    enable_flow_logs: bool = True
    flow_logs_retention: int = 14
    enable_network_firewall: bool = False
    network_acl_rules: str = "strict"
    
    @validator('cidr_block')
    def validate_cidr_block(cls, v):
        import ipaddress
        try:
            ipaddress.IPv4Network(v)
        except ValueError as e:
            raise ValueError(f'Invalid CIDR block: {e}')
        return v

# Template Request Model
class TemplateRequest(BaseModel):
    service_type: ServiceType
    requirements: Dict[str, Any]

# Scanner Result Model
class SecurityIssue(BaseModel):
    severity: str
    description: str
    resource: str
    remediation: str

# Template Response Model
class TemplateResponse(BaseModel):
    terraform_code: str
    security_score: float
    security_recommendations: List[SecurityIssue] = []
    inline_documentation: bool = True
    terraform_version: str = "1.0.0"

# Dependency injection for services
def get_ai_service():
    return AIService()

def get_terraform_service():
    return TerraformService()

def get_scanner_service():
    return ScannerService()

@router.post("/templates", response_model=TemplateResponse)
async def generate_template(
    request: TemplateRequest,
    ai_service: AIService = Depends(get_ai_service),
    terraform_service: TerraformService = Depends(get_terraform_service),
    scanner_service: ScannerService = Depends(get_scanner_service)
):
    """
    Generate a secure Terraform template based on user requirements
    """
    try:
        # Validate specific service requirements
        if request.service_type == ServiceType.s3:
            s3_request = S3Request(**request.requirements)
            request.requirements = s3_request.dict()
        elif request.service_type == ServiceType.ec2:
            ec2_request = EC2Request(**request.requirements)
            request.requirements = ec2_request.dict()
        elif request.service_type == ServiceType.vpc:
            vpc_request = VPCRequest(**request.requirements)
            request.requirements = vpc_request.dict()
            
        # Generate AI prompt based on requirements
        prompt = ai_service.generate_prompt(request.service_type, request.requirements)
        
        # Get Terraform code from AI service
        terraform_code = await ai_service.generate_terraform(prompt)
        
        # Process the terraform code
        processed_code = terraform_service.process_terraform(terraform_code, request.service_type)
        
        # Scan for security issues
        scan_results = scanner_service.scan_terraform(processed_code)
        
        # Calculate security score
        security_score = scanner_service.calculate_security_score(scan_results)
        
        # Add inline documentation
        documented_code = terraform_service.add_documentation(processed_code, request.service_type)
        
        return {
            "terraform_code": documented_code,
            "security_score": security_score,
            "security_recommendations": scan_results
        }
        
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate template: {str(e)}"
        )

@router.get("/templates/validate", response_model=Dict[str, Any])
async def validate_terraform(
    terraform_code: str,
    scanner_service: ScannerService = Depends(get_scanner_service)
):
    """
    Validate Terraform code for security issues
    """
    try:
        # Scan for security issues
        scan_results = scanner_service.scan_terraform(terraform_code)
        
        # Calculate security score
        security_score = scanner_service.calculate_security_score(scan_results)
        
        return {
            "valid": len(scan_results) == 0,
            "security_score": security_score,
            "security_recommendations": scan_results
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to validate template: {str(e)}"
        )