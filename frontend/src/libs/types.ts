/**
 * Type definitions for the application
 *
 * This file contains TypeScript interface definitions for data structures
 * used throughout the application.
 */

// S3 form data interface
export interface S3FormData {
    use_case: string;
    access_control: 'bucket_owner' | 'authenticated_users' | 'object_owner_control';
    compliance_framework?: string[];
    public_access: boolean;
    bucket_name: string;
    region: string;
  }
  
  // API response interface for Terraform code
  export interface TerraformResponse {
    terraform_code: string;
  }