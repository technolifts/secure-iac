import os
import tempfile
import subprocess
import json
import re
from typing import List, Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)

class ScannerService:
    """Service to scan Terraform code for security issues using Checkov"""
    
    def __init__(self):
        self._validate_checkov_installation()
        self.scan_severity_weights = {
            "HIGH": 1.0,
            "MEDIUM": 0.5,
            "LOW": 0.2,
            "INFO": 0.0
        }
    
    def _validate_checkov_installation(self):
        """Validate that Checkov is installed and accessible"""
        try:
            subprocess.run(
                ["checkov", "--version"], 
                capture_output=True, 
                check=True
            )
        except (subprocess.SubprocessError, FileNotFoundError):
            logger.warning("Checkov is not installed or not in PATH. Attempting to install...")
            try:
                subprocess.run(
                    ["pip", "install", "checkov"], 
                    capture_output=True, 
                    check=True
                )
            except subprocess.SubprocessError as e:
                logger.error(f"Failed to install Checkov: {e}")
                raise RuntimeError("Failed to install Checkov security scanner")
    
    def scan_terraform(self, terraform_code: str) -> List[Dict[str, str]]:
        """Scan Terraform code for security issues"""
        # Create a temporary file with the Terraform code
        with tempfile.NamedTemporaryFile(suffix=".tf", delete=False) as tf_file:
            tf_file.write(terraform_code.encode())
            tf_file_path = tf_file.name
        
        try:
            # Run Checkov against the temporary file
            result = subprocess.run(
                [
                    "checkov",
                    "--file", tf_file_path,
                    "--output", "json",
                    "--quiet"
                ],
                capture_output=True,
                text=True
            )
            
            # Parse the JSON output
            if result.stdout:
                try:
                    scan_data = json.loads(result.stdout)
                    return self._process_scan_results(scan_data)
                except json.JSONDecodeError as e:
                    logger.error(f"Failed to parse Checkov output as JSON: {e}")
                    logger.debug(f"Raw output: {result.stdout}")
            
            # If no JSON output or parse error, check if there were no findings
            if "No resources were detected" in result.stderr or "No checks were failed" in result.stderr:
                return []
            
            # Check for other errors
            if result.returncode != 0:
                logger.error(f"Checkov scan failed: {result.stderr}")
            
            return []
            
        except subprocess.SubprocessError as e:
            logger.error(f"Error running Checkov: {e}")
            return []
        finally:
            # Clean up the temporary file
            os.unlink(tf_file_path)
    
    def _process_scan_results(self, scan_data: Dict[str, Any]) -> List[Dict[str, str]]:
        """Process the Checkov scan results into a structured format"""
        security_issues = []
        
        if "results" not in scan_data:
            return security_issues
        
        # Extract failed checks
        failed_checks = scan_data["results"].get("failed_checks", [])
        
        for check in failed_checks:
            # Extract relevant information
            security_issues.append({
                "severity": check.get("severity", "UNKNOWN"),
                "description": check.get("check_name", "Unknown issue"),
                "resource": check.get("resource", "Unknown resource"),
                "remediation": self._generate_remediation_guidance(check)
            })
        
        return security_issues
    
    def _generate_remediation_guidance(self, check: Dict[str, Any]) -> str:
        """Generate remediation guidance based on the check"""
        # Extract the guideline if available
        if "guideline" in check and check["guideline"]:
            return check["guideline"]
        
        # Generate guidance based on check ID and description
        check_id = check.get("check_id", "")
        check_name = check.get("check_name", "")
        
        # S3 bucket-specific remediations
        if "S3" in check_id:
            if "encryption" in check_name.lower():
                return "Enable default encryption for the S3 bucket using AES-256 or KMS."
            elif "public" in check_name.lower():
                return "Block all public access to the S3 bucket unless specifically required."
            elif "versioning" in check_name.lower():
                return "Enable versioning on the S3 bucket to protect against accidental deletions."
            elif "logging" in check_name.lower():
                return "Enable access logging for the S3 bucket to track all requests."
        
        # EC2-specific remediations
        elif "EC2" in check_id:
            if "security group" in check_name.lower():
                return "Restrict security group rules to specific IP ranges and necessary ports only."
            elif "imdsv2" in check_name.lower() or "metadata service" in check_name.lower():
                return "Require IMDSv2 and set hop limit to 1 to prevent SSRF attacks."
            elif "encryption" in check_name.lower():
                return "Enable EBS volume encryption to protect data at rest."
        
        # VPC-specific remediations
        elif "VPC" in check_id:
            if "flow logs" in check_name.lower():
                return "Enable VPC flow logs for network monitoring and security analysis."
            elif "subnet" in check_name.lower():
                return "Use private subnets for resources that don't need direct internet access."
            elif "nacl" in check_name.lower() or "acl" in check_name.lower():
                return "Implement restrictive network ACLs to control traffic at the subnet level."
        
        # General guidance
        return "Review the resource configuration and implement the security best practice recommended by the check."
    
    def calculate_security_score(self, scan_results: List[Dict[str, str]]) -> float:
        """Calculate a security score based on scan results"""
        if not scan_results:
            return 100.0  # Perfect score if no issues
        
        # Count issues by severity
        severity_counts = {severity: 0 for severity in self.scan_severity_weights.keys()}
        
        for issue in scan_results:
            severity = issue.get("severity", "LOW")
            if severity in severity_counts:
                severity_counts[severity] += 1
        
        # Calculate weighted score
        total_weight = sum(self.scan_severity_weights.values())
        
        # Higher weights for more severe issues
        weighted_deduction = sum(
            count * (self.scan_severity_weights.get(severity, 0) / total_weight)
            for severity, count in severity_counts.items()
        )
        
        # Base score of 100, with deductions based on issues
        # Each high severity issue deducts ~5 points, medium ~2.5, low ~1
        raw_score = 100 - (weighted_deduction * 20)
        
        # Ensure score is between 0 and 100
        return max(0, min(100, round(raw_score, 1)))
    
    def auto_remediate(self, terraform_code: str, scan_results: List[Dict[str, str]]) -> str:
        """Attempt to automatically remediate common security issues"""
        remediated_code = terraform_code
        
        for issue in scan_results:
            resource = issue.get("resource", "")
            description = issue.get("description", "")
            
            # Skip if we don't have enough information
            if not resource or not description:
                continue
            
            # Extract resource type and name
            resource_match = re.match(r'^([a-zA-Z0-9_]+)\.([a-zA-Z0-9_]+)$', resource)
            if not resource_match:
                continue
                
            resource_type = resource_match.group(1)
            resource_name = resource_match.group(2)
            
            # Apply remediations based on resource type and issue
            if resource_type == "aws_s3_bucket":
                remediated_code = self._remediate_s3_issues(
                    remediated_code, resource_name, description
                )
            elif resource_type == "aws_instance":
                remediated_code = self._remediate_ec2_issues(
                    remediated_code, resource_name, description
                )
            elif resource_type == "aws_vpc":
                remediated_code = self._remediate_vpc_issues(
                    remediated_code, resource_name, description
                )
        
        return remediated_code
    
    def _remediate_s3_issues(self, code: str, resource_name: str, issue: str) -> str:
        """Remediate S3 bucket issues"""
        # Check for encryption issues
        if "encryption" in issue.lower():
            # Add encryption configuration if missing
            if f"aws_s3_bucket_server_side_encryption_configuration" not in code:
                encryption_block = f"""
resource "aws_s3_bucket_server_side_encryption_configuration" "{resource_name}" {{
  bucket = aws_s3_bucket.{resource_name}.id

  rule {{
    apply_server_side_encryption_by_default {{
      sse_algorithm = "AES256"
    }}
  }}
}}
"""
                code += encryption_block
        
        # Check for public access issues
        if "public" in issue.lower() and "access" in issue.lower():
            # Add public access block if missing
            if f"aws_s3_bucket_public_access_block" not in code:
                public_access_block = f"""
resource "aws_s3_bucket_public_access_block" "{resource_name}" {{
  bucket = aws_s3_bucket.{resource_name}.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}}
"""
                code += public_access_block
        
        # Check for versioning issues
        if "versioning" in issue.lower():
            # Add versioning configuration if missing
            if f"aws_s3_bucket_versioning" not in code:
                versioning_block = f"""
resource "aws_s3_bucket_versioning" "{resource_name}" {{
  bucket = aws_s3_bucket.{resource_name}.id
  versioning_configuration {{
    status = "Enabled"
  }}
}}
"""
                code += versioning_block
        
        # Check for logging issues
        if "logging" in issue.lower():
            # Add logging configuration if missing
            if f"aws_s3_bucket_logging" not in code:
                # Create a logging bucket if not present
                if "aws_s3_bucket" in code and "logging" not in code:
                    logging_bucket = f"""
resource "aws_s3_bucket" "logging" {{
  bucket = "${{aws_s3_bucket.{resource_name}.bucket}}-logs"
  
  tags = {{
    Name        = "${{aws_s3_bucket.{resource_name}.bucket}}-logs"
    Environment = "production"
    ManagedBy   = "terraform"
    Security    = "high"
    CreatedBy   = "secure-iac"
  }}
}}

resource "aws_s3_bucket_ownership_controls" "logging" {{
  bucket = aws_s3_bucket.logging.id
  rule {{
    object_ownership = "BucketOwnerPreferred"
  }}
}}

resource "aws_s3_bucket_acl" "logging" {{
  depends_on = [aws_s3_bucket_ownership_controls.logging]
  bucket = aws_s3_bucket.logging.id
  acl    = "log-delivery-write"
}}
"""
                    code += logging_bucket
                
                logging_config = f"""
resource "aws_s3_bucket_logging" "{resource_name}" {{
  bucket = aws_s3_bucket.{resource_name}.id

  target_bucket = aws_s3_bucket.logging.id
  target_prefix = "log/"
}}
"""
                code += logging_config
        
        return code
    
    def _remediate_ec2_issues(self, code: str, resource_name: str, issue: str) -> str:
        """Remediate EC2 instance issues"""
        # Pattern to match the EC2 instance resource block
        pattern = rf'resource\s+"aws_instance"\s+"{resource_name}"\s+{{(.*?)}}+'
        instance_match = re.search(pattern, code, re.DOTALL)
        
        if not instance_match:
            return code
            
        instance_block = instance_match.group(0)
        instance_content = instance_match.group(1)
        
        # Check for metadata service issues
        if "metadata" in issue.lower() or "imdsv2" in issue.lower():
            # Add metadata_options if missing
            if "metadata_options" not in instance_content:
                metadata_options = """
  metadata_options {
    http_endpoint               = "enabled"
    http_tokens                 = "required"
    http_put_response_hop_limit = 1
  }
"""
                # Insert before the closing brace
                new_instance_block = instance_block.replace("}", metadata_options + "}")
                code = code.replace(instance_block, new_instance_block)
        
        # Check for EBS encryption issues
        if "encryption" in issue.lower() and "ebs" in issue.lower():
            # Add root_block_device with encryption if missing
            if "root_block_device" not in instance_content:
                root_block_device = """
  root_block_device {
    encrypted = true
  }
"""
                # Insert before the closing brace
                new_instance_block = instance_block.replace("}", root_block_device + "}")
                code = code.replace(instance_block, new_instance_block)
            # If root_block_device exists but encryption is not enabled
            elif "root_block_device" in instance_content and "encrypted" not in instance_content:
                # Find the root_block_device block
                root_device_pattern = r'root_block_device\s+{(.*?)}'
                root_device_match = re.search(root_device_pattern, instance_content, re.DOTALL)
                
                if root_device_match:
                    root_device_block = root_device_match.group(0)
                    # Add encrypted attribute
                    new_root_device_block = root_device_block.replace("}", "  encrypted = true\n}")
                    new_instance_block = instance_block.replace(root_device_block, new_root_device_block)
                    code = code.replace(instance_block, new_instance_block)
        
        # Check for monitoring issues
        if "monitoring" in issue.lower():
            # Add monitoring if missing
            if "monitoring" not in instance_content:
                # Find a good position to insert (before the closing brace)
                new_instance_block = instance_block.replace("}", "  monitoring = true\n}")
                code = code.replace(instance_block, new_instance_block)
        
        return code
    
    def _remediate_vpc_issues(self, code: str, resource_name: str, issue: str) -> str:
        """Remediate VPC issues"""
        # Pattern to match the VPC resource block
        pattern = rf'resource\s+"aws_vpc"\s+"{resource_name}"\s+{{(.*?)}}+'
        vpc_match = re.search(pattern, code, re.DOTALL)
        
        if not vpc_match:
            return code
            
        vpc_block = vpc_match.group(0)
        vpc_content = vpc_match.group(1)
        
        # Check for flow logs issues
        if "flow" in issue.lower() and "log" in issue.lower():
            # Add flow logs if missing
            if "aws_flow_log" not in code:
                # Create IAM role for flow logs if not present
                if "aws_iam_role" not in code:
                    iam_role = f"""
resource "aws_iam_role" "flow_log_role" {{
  name = "flow-log-role"

  assume_role_policy = jsonencode({{
    Version = "2012-10-17"
    Statement = [
      {{
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {{
          Service = "vpc-flow-logs.amazonaws.com"
        }}
      }}
    ]
  }})
}}

resource "aws_iam_role_policy" "flow_log_policy" {{
  name = "flow-log-policy"
  role = aws_iam_role.flow_log_role.id

  policy = jsonencode({{
    Version = "2012-10-17"
    Statement = [
      {{
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "logs:DescribeLogGroups",
          "logs:DescribeLogStreams"
        ]
        Effect   = "Allow"
        Resource = "*"
      }}
    ]
  }})
}}
"""
                    code += iam_role
                
                # Add flow logs
                flow_logs = f"""
resource "aws_cloudwatch_log_group" "flow_log" {{
  name = "vpc-flow-log-{resource_name}"
  retention_in_days = 14
}}

resource "aws_flow_log" "{resource_name}" {{
  log_destination = aws_cloudwatch_log_group.flow_log.arn
  iam_role_arn   = aws_iam_role.flow_log_role.arn
  vpc_id         = aws_vpc.{resource_name}.id
  traffic_type   = "ALL"
}}
"""
                code += flow_logs
        
        # Check for DNS support issues
        if "dns" in issue.lower():
            # Add DNS attributes if missing
            if "enable_dns_support" not in vpc_content:
                # Insert DNS support attributes
                new_vpc_block = vpc_block.replace("}", "  enable_dns_support = true\n  enable_dns_hostnames = true\n}")
                code = code.replace(vpc_block, new_vpc_block)
        
        return code