"""
AI service for generating Terraform code.

This module handles interactions with the Anthropic API to generate
secure Terraform code based on user requirements.
"""

import anthropic
from anthropic import Anthropic
from app.config import settings
from app.api.routes.terraform import S3FormData

class AIService:
    """Service for interacting with Anthropic's Claude API."""
    
    def __init__(self):
        """Initialize the AI service with API client."""
        self.client = Anthropic(api_key=settings.ANTHROPIC_API_KEY)
        self.model = "claude-3-opus-20240229"
    
    async def generate_terraform_for_s3(self, form_data: S3FormData) -> str:
        """
        Generate Terraform code for an S3 bucket.
        
        Args:
            form_data: S3 bucket requirements from the form
            
        Returns:
            Formatted Terraform code
        """
        # Create prompt for the AI
        prompt = self._create_s3_prompt(form_data)
        
        # Call the Anthropic API
        response = self.client.messages.create(
            model=self.model,
            max_tokens=4000,
            temperature=0.2,  # Low temperature for more deterministic output
            system="You are a secure infrastructure as code expert. Your task is to generate secure Terraform code following AWS best practices. Only respond with valid Terraform code (HCL) without explanations or markdown formatting.",
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        
        # Extract the response content
        terraform_code = response.content[0].text
        
        # Clean up the response - remove markdown code blocks if present
        terraform_code = self._clean_terraform_code(terraform_code)
        
        return terraform_code
    
    def _create_s3_prompt(self, form_data: S3FormData) -> str:
        """
        Create a prompt for the AI to generate S3 bucket Terraform code.
        
        Args:
            form_data: S3 bucket requirements from the form
            
        Returns:
            Formatted prompt string
        """
        # Map access control options to meaningful descriptions
        access_control_map = {
            "bucket_owner": "Only the bucket owner should have access",
            "authenticated_users": "Any authenticated AWS user should have access",
            "object_owner_control": "Object owner controls write access, bucket owner has read access"
        }
        
        # Build the compliance framework string
        compliance_str = ""
        if form_data.compliance_framework:
            compliance_frameworks = ", ".join(form_data.compliance_framework)
            compliance_str = f"\nThe S3 bucket must comply with the following frameworks: {compliance_frameworks}."
        
        # Build the public access string
        public_access_str = "The bucket must NOT be accessible from the internet." if not form_data.public_access else "The bucket needs to be accessible from the internet for specific use cases."
        
        # Construct the prompt
        prompt = f"""
Create secure Terraform code for an AWS S3 bucket with the following requirements:

USE CASE:
{form_data.use_case}

ACCESS CONTROL:
{access_control_map[form_data.access_control]}

SECURITY REQUIREMENTS:
{public_access_str}{compliance_str}

CONFIGURATION:
Bucket Name: {form_data.bucket_name}
AWS Region: {form_data.region}

The generated Terraform code must follow these security best practices:
1. Implement server-side encryption (SSE) using AES-256 or KMS
2. Enable versioning for data protection
3. Configure access logging
4. Implement bucket policies that enforce least privilege
5. Block public access unless explicitly required
6. Set up lifecycle rules as appropriate for the use case
7. Apply appropriate tags for resource tracking

Return only valid Terraform code (HCL) without explanations. Include all necessary resources, including:
- aws_s3_bucket
- aws_s3_bucket_public_access_block
- aws_s3_bucket_versioning
- aws_s3_bucket_server_side_encryption_configuration
- aws_s3_bucket_logging (if appropriate)
- aws_s3_bucket_policy (with appropriate permissions)

Generate complete and production-ready Terraform code.
"""
        return prompt
    
    def _clean_terraform_code(self, code: str) -> str:
        """
        Clean up the AI response to extract just the Terraform code.
        
        Args:
            code: Raw code from the AI response
            
        Returns:
            Cleaned Terraform code
        """
        # Remove markdown code blocks if present
        if code.startswith("```") and code.endswith("```"):
            # Extract language if specified (e.g., ```terraform)
            first_line_end = code.find("\n")
            if first_line_end != -1:
                first_line = code[:first_line_end].strip()
                if first_line.startswith("```") and len(first_line) > 3:
                    # Skip language specifier line
                    code = code[first_line_end + 1:]
                else:
                    # Skip opening ```
                    code = code[3:]
            else:
                code = code[3:]
            
            # Remove closing ```
            if code.endswith("```"):
                code = code[:-3]
        
        return code.strip()