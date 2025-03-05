import re
import subprocess
import tempfile
import os
from typing import Dict, Any, List, Optional


class FormatterService:
    """Service to format and optimize Terraform code"""
    
    def __init__(self):
        self._check_terraform_installation()
    
    def _check_terraform_installation(self):
        """Check if Terraform is installed for formatting"""
        try:
            subprocess.run(["terraform", "version"], capture_output=True, check=True)
        except (subprocess.SubprocessError, FileNotFoundError):
            # If terraform is not available, we'll fall back to custom formatting
            pass
    
    def format_terraform(self, terraform_code: str) -> str:
        """Format Terraform code using terraform fmt or custom formatting"""
        try:
            # Try using terraform fmt if available
            with tempfile.NamedTemporaryFile(suffix=".tf", delete=False) as tf_file:
                tf_file.write(terraform_code.encode())
                tf_file_path = tf_file.name
            
            try:
                subprocess.run(["terraform", "fmt", tf_file_path], check=True)
                with open(tf_file_path, "r") as f:
                    formatted_code = f.read()
                return formatted_code
            except (subprocess.SubprocessError, FileNotFoundError):
                # Fall back to custom formatting
                return self._custom_format(terraform_code)
            finally:
                # Clean up the temporary file
                if os.path.exists(tf_file_path):
                    os.remove(tf_file_path)
        except Exception:
            # If any error occurs, return the original code
            return terraform_code
    
    def _custom_format(self, terraform_code: str) -> str:
        """Manually format Terraform code for consistency"""
        # Split the code into blocks
        blocks = re.split(r'(\n\s*\n)', terraform_code)
        formatted_blocks = []
        
        for block in blocks:
            if re.match(r'\s*resource\s+"[^"]+"\s+"[^"]+"\s+{', block):
                # Format resource blocks
                formatted_block = self._format_resource_block(block)
                formatted_blocks.append(formatted_block)
            elif re.match(r'\s*variable\s+"[^"]+"\s+{', block):
                # Format variable blocks
                formatted_block = self._format_variable_block(block)
                formatted_blocks.append(formatted_block)
            elif re.match(r'\s*output\s+"[^"]+"\s+{', block):
                # Format output blocks
                formatted_block = self._format_output_block(block)
                formatted_blocks.append(formatted_block)
            elif re.match(r'\s*provider\s+"[^"]+"\s+{', block):
                # Format provider blocks
                formatted_block = self._format_provider_block(block)
                formatted_blocks.append(formatted_block)
            elif re.match(r'\s*terraform\s+{', block):
                # Format terraform blocks
                formatted_block = self._format_terraform_block(block)
                formatted_blocks.append(formatted_block)
            else:
                # Keep other blocks unchanged
                formatted_blocks.append(block)
        
        # Join the formatted blocks back together
        formatted_code = ''.join(formatted_blocks)
        
        # Ensure consistent newlines between blocks
        formatted_code = re.sub(r'\n{3,}', '\n\n', formatted_code)
        
        return formatted_code
    
    def _format_resource_block(self, block: str) -> str:
        """Format a resource block with consistent indentation"""
        # Extract the resource type, name, and content
        match = re.match(r'(\s*resource\s+"[^"]+"\s+"[^"]+"\s+)({)(.*?)(})', block, re.DOTALL)
        if not match:
            return block
        
        prefix, open_brace, content, close_brace = match.groups()
        
        # Split content into lines
        lines = content.split('\n')
        
        # Format each line with proper indentation
        formatted_lines = []
        for line in lines:
            stripped = line.strip()
            if not stripped:
                continue
            
            # Check if it's a nested block
            if stripped.endswith('{'):
                # Nested block opening
                formatted_lines.append(f'  {stripped}')
            elif stripped == '}':
                # Nested block closing
                formatted_lines.append(f'  {stripped}')
            else:
                # Regular attribute
                formatted_lines.append(f'  {stripped}')
        
        # Join the formatted lines
        formatted_content = '\n'.join(formatted_lines)
        
        # Reconstruct the block
        return f"{prefix}{open_brace}\n{formatted_content}\n{close_brace}"
    
    def _format_variable_block(self, block: str) -> str:
        """Format a variable block with consistent indentation"""
        # Extract the variable name and content
        match = re.match(r'(\s*variable\s+"[^"]+"\s+)({)(.*?)(})', block, re.DOTALL)
        if not match:
            return block
        
        prefix, open_brace, content, close_brace = match.groups()
        
        # Split content into lines
        lines = content.split('\n')
        
        # Format each line with proper indentation
        formatted_lines = []
        for line in lines:
            stripped = line.strip()
            if not stripped:
                continue
            
            formatted_lines.append(f'  {stripped}')
        
        # Join the formatted lines
        formatted_content = '\n'.join(formatted_lines)
        
        # Reconstruct the block
        return f"{prefix}{open_brace}\n{formatted_content}\n{close_brace}"
    
    def _format_output_block(self, block: str) -> str:
        """Format an output block with consistent indentation"""
        # Similar to variable block formatting
        match = re.match(r'(\s*output\s+"[^"]+"\s+)({)(.*?)(})', block, re.DOTALL)
        if not match:
            return block
        
        prefix, open_brace, content, close_brace = match.groups()
        
        # Split content into lines
        lines = content.split('\n')
        
        # Format each line with proper indentation
        formatted_lines = []
        for line in lines:
            stripped = line.strip()
            if not stripped:
                continue
            
            formatted_lines.append(f'  {stripped}')
        
        # Join the formatted lines
        formatted_content = '\n'.join(formatted_lines)
        
        # Reconstruct the block
        return f"{prefix}{open_brace}\n{formatted_content}\n{close_brace}"
    
    def _format_provider_block(self, block: str) -> str:
        """Format a provider block with consistent indentation"""
        # Similar to other block formatting
        match = re.match(r'(\s*provider\s+"[^"]+"\s+)({)(.*?)(})', block, re.DOTALL)
        if not match:
            return block
        
        prefix, open_brace, content, close_brace = match.groups()
        
        # Split content into lines
        lines = content.split('\n')
        
        # Format each line with proper indentation
        formatted_lines = []
        for line in lines:
            stripped = line.strip()
            if not stripped:
                continue
            
            formatted_lines.append(f'  {stripped}')
        
        # Join the formatted lines
        formatted_content = '\n'.join(formatted_lines)
        
        # Reconstruct the block
        return f"{prefix}{open_brace}\n{formatted_content}\n{close_brace}"
    
    def _format_terraform_block(self, block: str) -> str:
        """Format a terraform configuration block with consistent indentation"""
        # Similar to other block formatting
        match = re.match(r'(\s*terraform\s+)({)(.*?)(})', block, re.DOTALL)
        if not match:
            return block
        
        prefix, open_brace, content, close_brace = match.groups()
        
        # Split content into lines
        lines = content.split('\n')
        
        # Format each line with proper indentation
        formatted_lines = []
        current_indent = 2
        
        for line in lines:
            stripped = line.strip()
            if not stripped:
                continue
            
            # Check for nested blocks
            if stripped.endswith('{'):
                formatted_lines.append(f"{' ' * current_indent}{stripped}")
                current_indent += 2
            elif stripped == '}':
                current_indent -= 2
                formatted_lines.append(f"{' ' * current_indent}{stripped}")
            else:
                formatted_lines.append(f"{' ' * current_indent}{stripped}")
        
        # Join the formatted lines
        formatted_content = '\n'.join(formatted_lines)
        
        # Reconstruct the block
        return f"{prefix}{open_brace}\n{formatted_content}\n{close_brace}"

    def generate_module_structure(self, terraform_code: str, service_type: str) -> Dict[str, str]:
        """
        Generate a proper Terraform module structure with multiple files
        
        Returns a dictionary with filenames as keys and file contents as values
        """
        files = {}
        
        # Parse the Terraform code
        # Extract provider, terraform, variables, resources, and outputs
        terraform_block = self._extract_terraform_block(terraform_code)
        provider_block = self._extract_provider_block(terraform_code)
        variable_blocks = self._extract_variable_blocks(terraform_code)
        resource_blocks = self._extract_resource_blocks(terraform_code)
        output_blocks = self._extract_output_blocks(terraform_code)
        
        # Create main.tf with terraform block, provider, and resources
        main_tf = ""
        if terraform_block:
            main_tf += terraform_block + "\n\n"
        if provider_block:
            main_tf += provider_block + "\n\n"
        if resource_blocks:
            main_tf += "\n\n".join(resource_blocks)
        
        files["main.tf"] = main_tf
        
        # Create variables.tf
        if variable_blocks:
            files["variables.tf"] = "\n\n".join(variable_blocks)
        
        # Create outputs.tf
        if output_blocks:
            files["outputs.tf"] = "\n\n".join(output_blocks)
        
        # Create README.md
        readme = self._generate_readme(service_type)
        files["README.md"] = readme
        
        return files
    
    def _extract_terraform_block(self, terraform_code: str) -> str:
        """Extract terraform configuration block from code"""
        match = re.search(r'terraform\s+{.*?}', terraform_code, re.DOTALL)
        if match:
            return match.group(0)
        return ""
    
    def _extract_provider_block(self, terraform_code: str) -> str:
        """Extract provider block from code"""
        match = re.search(r'provider\s+"[^"]+"\s+{.*?}', terraform_code, re.DOTALL)
        if match:
            return match.group(0)
        return ""
    
    def _extract_variable_blocks(self, terraform_code: str) -> List[str]:
        """Extract all variable blocks from code"""
        variable_blocks = re.findall(r'variable\s+"[^"]+"\s+{.*?}', terraform_code, re.DOTALL)
        return variable_blocks
    
    def _extract_resource_blocks(self, terraform_code: str) -> List[str]:
        """Extract all resource blocks from code"""
        resource_blocks = re.findall(r'resource\s+"[^"]+"\s+"[^"]+"\s+{.*?}', terraform_code, re.DOTALL)
        return resource_blocks
    
    def _extract_output_blocks(self, terraform_code: str) -> List[str]:
        """Extract all output blocks from code"""
        output_blocks = re.findall(r'output\s+"[^"]+"\s+{.*?}', terraform_code, re.DOTALL)
        return output_blocks
    
    def _generate_readme(self, service_type: str) -> str:
        """Generate a README file for the module"""
        if service_type == "s3":
            title = "Secure S3 Bucket"
            description = "This Terraform module creates an AWS S3 bucket with security best practices built-in."
            features = [
                "Server-side encryption",
                "Versioning for data protection",
                "Access logging",
                "Public access blocking",
                "Secure bucket policies",
                "Lifecycle management"
            ]
        elif service_type == "ec2":
            title = "Secure EC2 Instance"
            description = "This Terraform module creates a secure AWS EC2 instance with security best practices built-in."
            features = [
                "IMDSv2 requirement for enhanced security",
                "EBS volume encryption",
                "Security groups with least privilege",
                "Detailed monitoring",
                "Automated backups",
                "Optional auto-scaling configuration"
            ]
        elif service_type == "vpc":
            title = "Secure VPC"
            description = "This Terraform module creates a secure AWS VPC with security best practices built-in."
            features = [
                "Network segmentation with public and private subnets",
                "VPC Flow Logs for network monitoring",
                "Restrictive Network ACLs",
                "NAT Gateway for private subnet internet access",
                "DNS security settings",
                "Optional VPN Gateway configuration"
            ]
        else:
            title = f"Secure {service_type.upper()}"
            description = f"This Terraform module creates AWS {service_type.upper()} resources with security best practices built-in."
            features = [
                "Security best practices by default",
                "Complete with all necessary configuration",
                "Well-documented code for maintainability"
            ]
        
        readme = f"""# {title}

{description}

## Features

{chr(10).join(['- ' + feature for feature in features])}

## Usage

```hcl
module "secure_{service_type}" {{
  source = "./secure_{service_type}"
  
  # Required variables
  region     = "us-west-2"
  name       = "example-{service_type}"
  
  # Optional variables - see variables.tf for all options
}}
```

## Requirements

| Name | Version |
|------|---------|
| terraform | >= 1.2.0 |
| aws | ~> 4.16 |

## Providers

| Name | Version |
|------|---------|
| aws | ~> 4.16 |

## Security Considerations

This module implements security best practices by default. If you need to disable any security features, please consider the security implications carefully.

## License

This code is provided under the MIT License.
"""
        return readme