import re
import json
from typing import Dict, Any, List

class TerraformService:
    """Service to process and enhance Terraform code"""
    
    def __init__(self):
        # Load documentation templates
        self.documentation_templates = self._load_documentation_templates()
    
    def _load_documentation_templates(self) -> Dict[str, Dict[str, str]]:
        """Load documentation templates for different resources"""
        return {
            "aws_s3_bucket": {
                "standard": "# S3 bucket configured with security best practices\n# - Server-side encryption enabled\n# - Versioning enabled for data protection\n# - Public access blocked by default",
                "encryption": "# Encryption Configuration:\n# - AES256: Server-side encryption with Amazon S3-managed keys\n# - aws:kms: Server-side encryption with AWS KMS-managed keys",
                "versioning": "# Versioning Configuration:\n# - Protects against accidental deletion and provides audit trail\n# - Required for compliance frameworks like HIPAA and PCI DSS",
                "logging": "# Access Logging Configuration:\n# - Tracks all requests made to the bucket\n# - Important for security auditing and compliance",
                "lifecycle": "# Lifecycle Configuration:\n# - Manages objects throughout their lifecycle to optimize costs\n# - Automatically transitions or expires objects based on age",
                "cors": "# CORS Configuration:\n# - Controls which domains can access bucket content\n# - Restricts access to specified origins only",
                "public_access_block": "# Public Access Block:\n# - Prevents public access to the bucket at the account level\n# - Additional layer of protection against accidental exposure",
            },
            "aws_ec2_instance": {
                "standard": "# EC2 instance configured with security best practices\n# - IMDSv2 required for enhanced security\n# - EBS volumes encrypted by default\n# - Secure security group configuration",
                "security_groups": "# Security Group Configuration:\n# - Follows principle of least privilege\n# - Only necessary ports are opened\n# - Restricts access to specific CIDR blocks",
                "instance_metadata": "# Instance Metadata Service Configuration:\n# - IMDSv2 required to prevent SSRF attacks\n# - Hop limit set to 1 to prevent token exfiltration",
                "monitoring": "# Monitoring Configuration:\n# - Enables detailed CloudWatch monitoring\n# - Provides metrics at 1-minute intervals for better visibility",
                "encryption": "# EBS Encryption Configuration:\n# - All volumes encrypted at rest using AWS KMS\n# - Protects data confidentiality and meets compliance requirements",
                "auto_scaling": "# Auto Scaling Configuration:\n# - Automatically adjusts capacity based on demand\n# - Ensures high availability and performance",
            },
            "aws_vpc": {
                "standard": "# VPC configured with security best practices\n# - Network segmentation with public and private subnets\n# - DNS support enabled for resource discovery\n# - Flow logs enabled for network monitoring",
                "network_acl": "# Network ACL Configuration:\n# - Stateless firewall controlling traffic in and out of subnets\n# - Provides additional layer of security beyond security groups",
                "flow_logs": "# Flow Logs Configuration:\n# - Captures information about IP traffic going to and from network interfaces\n# - Essential for network monitoring, troubleshooting, and security analysis",
                "nat_gateway": "# NAT Gateway Configuration:\n# - Allows instances in private subnets to access the internet\n# - While preventing inbound connections from the internet",
                "subnet_config": "# Subnet Configuration:\n# - Public subnets for internet-facing resources\n# - Private subnets for internal resources with no direct internet access",
                "dns_config": "# DNS Configuration:\n# - Enables DNS resolution for resources within the VPC\n# - Allows instances to resolve public DNS hostnames to private IP addresses",
            }
        }
    
    def process_terraform(self, terraform_code: str, service_type: str) -> str:
        """Process and enhance the Terraform code"""
        # Ensure the terraform block is present
        if "terraform {" not in terraform_code:
            terraform_block = """
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.16"
    }
  }
  required_version = ">= 1.2.0"
}
"""
            terraform_code = terraform_block + "\n" + terraform_code
        
        # Add provider block if missing
        if "provider \"aws\"" not in terraform_code:
            provider_block = """
provider "aws" {
  region = var.region
}
"""
            terraform_code = terraform_code + "\n" + provider_block
        
        # Add variables block if missing
        if service_type == "s3" and "variable" not in terraform_code:
            variables_block = """
variable "region" {
  description = "The AWS region to deploy resources"
  type        = string
}

variable "bucket_name" {
  description = "The name of the S3 bucket"
  type        = string
}
"""
            terraform_code = terraform_code + "\n" + variables_block
        elif service_type == "ec2" and "variable" not in terraform_code:
            variables_block = """
variable "region" {
  description = "The AWS region to deploy resources"
  type        = string
}

variable "instance_name" {
  description = "The name of the EC2 instance"
  type        = string
}
"""
            terraform_code = terraform_code + "\n" + variables_block
        elif service_type == "vpc" and "variable" not in terraform_code:
            variables_block = """
variable "region" {
  description = "The AWS region to deploy resources"
  type        = string
}

variable "vpc_name" {
  description = "The name of the VPC"
  type        = string
}
"""
            terraform_code = terraform_code + "\n" + variables_block
        
        # Add outputs if missing
        if "output" not in terraform_code:
            if service_type == "s3":
                outputs_block = """
output "bucket_id" {
  description = "The ID of the S3 bucket"
  value       = aws_s3_bucket.main.id
}

output "bucket_arn" {
  description = "The ARN of the S3 bucket"
  value       = aws_s3_bucket.main.arn
}
"""
                terraform_code = terraform_code + "\n" + outputs_block
            elif service_type == "ec2":
                outputs_block = """
output "instance_id" {
  description = "The ID of the EC2 instance"
  value       = aws_instance.main.id
}

output "instance_private_ip" {
  description = "The private IP address of the EC2 instance"
  value       = aws_instance.main.private_ip
}

output "instance_public_ip" {
  description = "The public IP address of the EC2 instance"
  value       = aws_instance.main.public_ip
}
"""
                terraform_code = terraform_code + "\n" + outputs_block
            elif service_type == "vpc":
                outputs_block = """
output "vpc_id" {
  description = "The ID of the VPC"
  value       = aws_vpc.main.id
}

output "vpc_cidr_block" {
  description = "The CIDR block of the VPC"
  value       = aws_vpc.main.cidr_block
}

output "public_subnet_ids" {
  description = "List of IDs of public subnets"
  value       = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  description = "List of IDs of private subnets"
  value       = aws_subnet.private[*].id
}
"""
                terraform_code = terraform_code + "\n" + outputs_block
        
        # Add tags to resources if missing
        terraform_code = self._add_tags_to_resources(terraform_code, service_type)
        
        return terraform_code
    
    def _add_tags_to_resources(self, terraform_code: str, service_type: str) -> str:
        """Add tags to AWS resources if they don't have tags"""
        # Regular expression to match resource blocks without tags
        resource_pattern = r'(resource\s+"([^"]+)"\s+"([^"]+)"\s+{(?:(?!tags).)*?})(\s*\n|\s*$)'
        
        # Tags to add
        default_tags = """
  tags = {
    Name        = var.%s
    Environment = "production"
    ManagedBy   = "terraform"
    Security    = "high"
    CreatedBy   = "secure-iac"
  }
"""
        
        # Add tags based on service type
        if service_type == "s3":
            var_name = "bucket_name"
        elif service_type == "ec2":
            var_name = "instance_name"
        elif service_type == "vpc":
            var_name = "vpc_name"
        else:
            var_name = "name"
        
        # Replace resource blocks with tagged versions
        def add_tags(match):
            resource_type = match.group(2)
            # Only add tags to AWS resources
            if resource_type.startswith("aws_"):
                resource_block = match.group(1)
                # Check if the resource block doesn't already end with a newline
                if not resource_block.endswith("\n"):
                    resource_block += "\n"
                return resource_block + default_tags % var_name + match.group(4)
            return match.group(0)
        
        return re.sub(resource_pattern, add_tags, terraform_code, flags=re.DOTALL)
    
    def add_documentation(self, terraform_code: str, service_type: str) -> str:
        """Add inline documentation to Terraform code"""
        # Add header documentation
        header_doc = f"""# Secure Terraform Configuration for AWS {service_type.upper()}
# Generated by Secure IaC
# This configuration follows AWS security best practices
# and implements secure defaults for {service_type.upper()} resources.
#
# Security features implemented:
# - Resource-level encryption
# - Limited network access
# - Logging and monitoring
# - Secure authentication and authorization
# - Compliance controls
#
"""
        documented_code = header_doc + terraform_code
        
        # Add resource-specific documentation
        if service_type == "s3":
            documented_code = self._add_s3_documentation(documented_code)
        elif service_type == "ec2":
            documented_code = self._add_ec2_documentation(documented_code)
        elif service_type == "vpc":
            documented_code = self._add_vpc_documentation(documented_code)
        
        return documented_code
    
    def _add_s3_documentation(self, terraform_code: str) -> str:
        """Add S3-specific documentation"""
        # Add bucket documentation
        terraform_code = re.sub(
            r'(resource\s+"aws_s3_bucket"\s+"[^"]+"\s+{)',
            f'{self.documentation_templates["aws_s3_bucket"]["standard"]}\n\\1',
            terraform_code
        )
        
        # Add encryption documentation
        terraform_code = re.sub(
            r'(resource\s+"aws_s3_bucket_server_side_encryption_configuration"\s+"[^"]+"\s+{)',
            f'{self.documentation_templates["aws_s3_bucket"]["encryption"]}\n\\1',
            terraform_code
        )
        
        # Add versioning documentation
        terraform_code = re.sub(
            r'(resource\s+"aws_s3_bucket_versioning"\s+"[^"]+"\s+{)',
            f'{self.documentation_templates["aws_s3_bucket"]["versioning"]}\n\\1',
            terraform_code
        )
        
        # Add logging documentation
        terraform_code = re.sub(
            r'(resource\s+"aws_s3_bucket_logging"\s+"[^"]+"\s+{)',
            f'{self.documentation_templates["aws_s3_bucket"]["logging"]}\n\\1',
            terraform_code
        )
        
        # Add lifecycle documentation
        terraform_code = re.sub(
            r'(resource\s+"aws_s3_bucket_lifecycle_configuration"\s+"[^"]+"\s+{)',
            f'{self.documentation_templates["aws_s3_bucket"]["lifecycle"]}\n\\1',
            terraform_code
        )
        
        # Add CORS documentation
        terraform_code = re.sub(
            r'(resource\s+"aws_s3_bucket_cors_configuration"\s+"[^"]+"\s+{)',
            f'{self.documentation_templates["aws_s3_bucket"]["cors"]}\n\\1',
            terraform_code
        )
        
        # Add public access block documentation
        terraform_code = re.sub(
            r'(resource\s+"aws_s3_bucket_public_access_block"\s+"[^"]+"\s+{)',
            f'{self.documentation_templates["aws_s3_bucket"]["public_access_block"]}\n\\1',
            terraform_code
        )
        
        return terraform_code
    
    def _add_ec2_documentation(self, terraform_code: str) -> str:
        """Add EC2-specific documentation"""
        # Add instance documentation
        terraform_code = re.sub(
            r'(resource\s+"aws_instance"\s+"[^"]+"\s+{)',
            f'{self.documentation_templates["aws_ec2_instance"]["standard"]}\n\\1',
            terraform_code
        )
        
        # Add security group documentation
        terraform_code = re.sub(
            r'(resource\s+"aws_security_group"\s+"[^"]+"\s+{)',
            f'{self.documentation_templates["aws_ec2_instance"]["security_groups"]}\n\\1',
            terraform_code
        )
        
        # Add monitoring documentation if present
        if 'monitoring = true' in terraform_code:
            # Find the instance resource with monitoring
            pattern = r'(resource\s+"aws_instance"[^{]*{[^}]*monitoring\s*=\s*true[^}]*})'
            match = re.search(pattern, terraform_code, re.DOTALL)
            if match:
                # Get the position to insert the documentation
                start_pos = match.start(1)
                # Find the line before the resource declaration
                prev_newline = terraform_code.rfind('\n', 0, start_pos)
                if prev_newline != -1:
                    # Insert documentation before the resource
                    terraform_code = (
                        terraform_code[:prev_newline] + 
                        '\n' + self.documentation_templates["aws_ec2_instance"]["monitoring"] + 
                        terraform_code[prev_newline:]
                    )
        
        # Add metadata documentation if IMDSv2 is configured
        if 'metadata_options' in terraform_code:
            # Find the instance resource with metadata options
            pattern = r'(resource\s+"aws_instance"[^{]*{[^}]*metadata_options[^}]*})'
            match = re.search(pattern, terraform_code, re.DOTALL)
            if match:
                # Insert documentation before the metadata_options block
                terraform_code = re.sub(
                    r'(\s+metadata_options\s*{)',
                    f'\n  {self.documentation_templates["aws_ec2_instance"]["instance_metadata"]}\n\\1',
                    terraform_code
                )
        
        # Add auto scaling documentation if present
        if 'aws_autoscaling_group' in terraform_code:
            terraform_code = re.sub(
                r'(resource\s+"aws_autoscaling_group"\s+"[^"]+"\s+{)',
                f'{self.documentation_templates["aws_ec2_instance"]["auto_scaling"]}\n\\1',
                terraform_code
            )
        
        return terraform_code
    
    def _add_vpc_documentation(self, terraform_code: str) -> str:
        """Add VPC-specific documentation"""
        # Add VPC documentation
        terraform_code = re.sub(
            r'(resource\s+"aws_vpc"\s+"[^"]+"\s+{)',
            f'{self.documentation_templates["aws_vpc"]["standard"]}\n\\1',
            terraform_code
        )
        
        # Add subnet configuration documentation
        terraform_code = re.sub(
            r'(resource\s+"aws_subnet"\s+"[^"]+"\s+{)',
            f'{self.documentation_templates["aws_vpc"]["subnet_config"]}\n\\1',
            terraform_code
        )
        
        # Add NAT gateway documentation
        terraform_code = re.sub(
            r'(resource\s+"aws_nat_gateway"\s+"[^"]+"\s+{)',
            f'{self.documentation_templates["aws_vpc"]["nat_gateway"]}\n\\1',
            terraform_code
        )
        
        # Add flow logs documentation
        terraform_code = re.sub(
            r'(resource\s+"aws_flow_log"\s+"[^"]+"\s+{)',
            f'{self.documentation_templates["aws_vpc"]["flow_logs"]}\n\\1',
            terraform_code
        )
        
        # Add network ACL documentation
        terraform_code = re.sub(
            r'(resource\s+"aws_network_acl"\s+"[^"]+"\s+{)',
            f'{self.documentation_templates["aws_vpc"]["network_acl"]}\n\\1',
            terraform_code
        )
        
        return terraform_code