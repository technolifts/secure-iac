import os
import anthropic
import json
from typing import Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)

class AIService:
    """Service to handle interactions with the AI model for generating Terraform code"""
    
    def __init__(self):
        self.api_key = os.getenv("ANTHROPIC_API_KEY")
        if not self.api_key:
            logger.warning("ANTHROPIC_API_KEY environment variable not set")
        
        self.client = anthropic.Anthropic(api_key=self.api_key)
        self.model = "claude-3-opus-20240229"
        
        # Load prompt templates
        self.templates = self._load_prompt_templates()
    
    def _load_prompt_templates(self) -> Dict[str, str]:
        """Load prompt templates from file"""
        templates_path = os.path.join(os.path.dirname(__file__), "../templates/prompts")
        templates = {}
        
        for service in ["s3", "ec2", "vpc"]:
            try:
                with open(f"{templates_path}/{service}_template.txt", "r") as f:
                    templates[service] = f.read()
            except FileNotFoundError:
                # Default templates if files not found
                templates[service] = self._get_default_template(service)
        
        return templates
    
    def _get_default_template(self, service: str) -> str:
        """Get default prompt template for a service"""
        if service == "s3":
            return """
            Create secure Terraform code for an AWS S3 bucket with the following requirements:
            
            {{requirements}}
            
            Ensure the following security best practices are implemented:
            1. Server-side encryption
            2. Proper access controls
            3. Versioning for data protection
            4. Access logging
            5. Block public access by default
            6. Secure bucket policies
            7. Implement lifecycle policies if specified
            
            Return only valid Terraform code (HCL) without explanations.
            """
        elif service == "ec2":
            return """
            Create secure Terraform code for AWS EC2 instances with the following requirements:
            
            {{requirements}}
            
            Ensure the following security best practices are implemented:
            1. Security groups with least privilege
            2. IMDSv2 requirement
            3. EBS volume encryption
            4. Instance monitoring
            5. VPC placement with proper network isolation
            6. Security patches via latest AMIs
            7. Proper IAM instance profile with least privilege
            
            Return only valid Terraform code (HCL) without explanations.
            """
        elif service == "vpc":
            return """
            Create secure Terraform code for an AWS VPC with the following requirements:
            
            {{requirements}}
            
            Ensure the following security best practices are implemented:
            1. Proper network segmentation with public and private subnets
            2. Network ACLs with restrictive rules
            3. Security Groups for specific resources
            4. VPC Flow Logs for network monitoring
            5. NAT Gateways for private subnet outbound access
            6. DNS support and resolution
            7. Network Firewall if requested
            
            Return only valid Terraform code (HCL) without explanations.
            """
        else:
            return "Create secure Terraform code for {{service}} with the following requirements:\n\n{{requirements}}"
    
    def generate_prompt(self, service_type: str, requirements: Dict[str, Any]) -> str:
        """Generate a prompt for the AI based on service type and requirements"""
        template = self.templates.get(service_type, self._get_default_template(service_type))
        
        # Convert requirements to a formatted string
        requirements_str = json.dumps(requirements, indent=2)
        
        # Replace placeholders in the template
        prompt = template.replace("{{requirements}}", requirements_str)
        prompt = prompt.replace("{{service}}", service_type)
        
        # Add security context based on service
        security_context = self._get_security_context(service_type, requirements)
        if security_context:
            prompt += f"\n\nAdditional security considerations:\n{security_context}"
        
        return prompt
    
    def _get_security_context(self, service_type: str, requirements: Dict[str, Any]) -> Optional[str]:
        """Generate additional security context based on requirements"""
        if service_type == "s3":
            contexts = []
            
            if requirements.get("public_access_enabled", False):
                contexts.append("- Since public access is enabled, implement strict bucket policies and CORS settings")
            
            compliance_type = requirements.get("compliance_type", "standard")
            if compliance_type == "hipaa":
                contexts.append("- Implement HIPAA compliance controls: encryption, access logging, and strict access controls")
            elif compliance_type == "pci":
                contexts.append("- Implement PCI DSS compliance controls: encryption, access logging, strict access controls, and audit trails")
            
            return "\n".join(contexts) if contexts else None
            
        elif service_type == "ec2":
            contexts = []
            
            if requirements.get("associate_public_ip", False):
                contexts.append("- Since public IP is enabled, implement strict security groups and consider a bastion host pattern")
            
            security_level = requirements.get("security_level", "high")
            if security_level == "high":
                contexts.append("- Implement high security controls: restrict all ports except essential services, use SSM instead of SSH when possible")
            
            return "\n".join(contexts) if contexts else None
            
        elif service_type == "vpc":
            contexts = []
            
            if requirements.get("enable_vpn_gateway", True):
                contexts.append("- For the VPN Gateway, implement strong encryption and proper routing")
            
            if requirements.get("network_acl_rules", "") == "strict":
                contexts.append("- Implement strict network ACLs with deny-by-default approach")
            
            return "\n".join(contexts) if contexts else None
        
        return None
    
    async def generate_terraform(self, prompt: str) -> str:
        """Generate Terraform code using the AI model"""
        try:
            response = self.client.messages.create(
                model=self.model,
                max_tokens=4000,
                temperature=0.2,  # Low temperature for more deterministic output
                system="You are a secure infrastructure as code expert. Your task is to generate secure Terraform code following AWS best practices. Only respond with valid Terraform code (HCL) without explanations or markdown formatting.",
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )
            
            # Extract Terraform code from response
            terraform_code = response.content[0].text
            
            # Clean up any markdown formatting that might be present
            terraform_code = self._clean_terraform_code(terraform_code)
            
            return terraform_code
            
        except Exception as e:
            logger.error(f"Error generating Terraform code: {e}")
            raise Exception(f"Failed to generate Terraform code: {str(e)}")
    
    def _clean_terraform_code(self, code: str) -> str:
        """Clean up markdown formatting from code"""
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