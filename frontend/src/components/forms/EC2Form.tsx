'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFormContext } from '../../context/FormContext';
import { 
  InputField, 
  SelectField, 
  CheckboxField, 
  RadioGroup,
  FormSection
} from '../../components/forms/FormComponents';

const EC2Form: React.FC = () => {
  const router = useRouter();
  const { formData, updateFormData } = useFormContext();
  
  // Initial form state from context or defaults
  const [form, setForm] = useState({
    instanceName: formData.ec2.instanceName || '',
    region: formData.ec2.region || '',
    instanceType: formData.ec2.instanceType || '',
    amiId: formData.ec2.amiId || 'ami-default', // Default secure AMI
    customAmiId: formData.ec2.customAmiId || '', // Add customAmiId field
    vpcId: formData.ec2.vpcId || 'default',
    subnetId: formData.ec2.subnetId || 'default',
    keyPairName: formData.ec2.keyPairName || '',
    associatePublicIp: formData.ec2.associatePublicIp || false,
    ebsEncryption: formData.ec2.ebsEncryption || true,
    ebsVolumeSize: formData.ec2.ebsVolumeSize || '20',
    backupEnabled: formData.ec2.backupEnabled || true,
    cloudWatchMonitoring: formData.ec2.cloudWatchMonitoring || 'basic',
    securityLevel: formData.ec2.securityLevel || 'high',
    autoScaling: formData.ec2.autoScaling || false,
    minInstances: formData.ec2.minInstances || '1',
    maxInstances: formData.ec2.maxInstances || '3',
    userData: formData.ec2.userData || '',
  });
  
  // Form validation state
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setForm(prev => ({ ...prev, [id]: value }));
    
    // Clear error when field is edited
    if (errors[id]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
    }
  };
  
  // Handle checkbox changes
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, checked } = e.target;
    setForm(prev => ({ ...prev, [id]: checked }));
  };
  
  // Handle radio changes
  const handleRadioChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };
  
  // Handle textarea changes
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setForm(prev => ({ ...prev, [id]: value }));
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!form.instanceName) {
      newErrors.instanceName = 'Instance name is required';
    }
    
    if (!form.region) {
      newErrors.region = 'Region is required';
    }
    
    if (!form.instanceType) {
      newErrors.instanceType = 'Instance type is required';
    }
    
    if (form.autoScaling) {
      const minInstances = parseInt(form.minInstances);
      const maxInstances = parseInt(form.maxInstances);
      
      if (isNaN(minInstances) || minInstances < 1) {
        newErrors.minInstances = 'Minimum instances must be at least 1';
      }
      
      if (isNaN(maxInstances) || maxInstances < minInstances) {
        newErrors.maxInstances = 'Maximum instances must be greater than or equal to minimum instances';
      }
    }
    
    const ebsVolumeSize = parseInt(form.ebsVolumeSize);
    if (isNaN(ebsVolumeSize) || ebsVolumeSize < 8) {
      newErrors.ebsVolumeSize = 'EBS volume size must be at least 8 GB';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Save form data to context
      updateFormData('ec2', form);
      
      // Navigate to the next step
      router.push('/create/ec2/review');
    }
  };
  
  // AWS regions
  const regions = [
    { value: 'us-east-1', label: 'US East (N. Virginia)' },
    { value: 'us-east-2', label: 'US East (Ohio)' },
    { value: 'us-west-1', label: 'US West (N. California)' },
    { value: 'us-west-2', label: 'US West (Oregon)' },
    { value: 'eu-west-1', label: 'EU (Ireland)' },
    { value: 'eu-central-1', label: 'EU (Frankfurt)' },
  ];
  
  // Instance types
  const instanceTypes = [
    { value: 't3.micro', label: 't3.micro (2 vCPU, 1 GiB RAM)' },
    { value: 't3.small', label: 't3.small (2 vCPU, 2 GiB RAM)' },
    { value: 't3.medium', label: 't3.medium (2 vCPU, 4 GiB RAM)' },
    { value: 'm5.large', label: 'm5.large (2 vCPU, 8 GiB RAM)' },
    { value: 'c5.large', label: 'c5.large (2 vCPU, 4 GiB RAM, compute optimized)' },
  ];
  
  // AMI options
  const amiOptions = [
    { value: 'ami-default', label: 'Amazon Linux 2 (Hardened)', description: 'Security-hardened Amazon Linux 2 AMI with latest patches' },
    { value: 'ami-ubuntu', label: 'Ubuntu 20.04 LTS (Hardened)', description: 'Security-hardened Ubuntu 20.04 LTS AMI with latest patches' },
    { value: 'ami-custom', label: 'Custom AMI ID', description: 'Use your own AMI ID (must be in the selected region)' },
  ];
  
  // Monitoring options
  const monitoringOptions = [
    { value: 'basic', label: 'Basic Monitoring', description: 'Metrics every 5 minutes' },
    { value: 'detailed', label: 'Detailed Monitoring', description: 'Metrics every 1 minute (additional cost)' },
  ];
  
  // Security level options
  const securityLevelOptions = [
    { value: 'high', label: 'High Security', description: 'Most restrictive security groups, no public access except via bastion host' },
    { value: 'medium', label: 'Medium Security', description: 'Restricted security groups, allow specific public access ports' },
    { value: 'standard', label: 'Standard Security', description: 'Common ports open with restrictions' },
  ];
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Configure EC2 Instance</h1>
        <p className="text-lg text-gray-600">
          Configure your secure EC2 instance with the parameters below. Security best practices will be applied automatically.
        </p>
      </div>
      <form onSubmit={handleSubmit}>
    <FormSection 
      title="Basic Information" 
      description="Provide the basic details for your EC2 instance"
    >
      <InputField
        id="instanceName"
        label="Instance Name"
        value={form.instanceName}
        onChange={handleChange}
        helperText="A descriptive name for your instance"
        required
        error={errors.instanceName}
      />
      
      <SelectField
        id="region"
        label="Region"
        options={regions}
        value={form.region}
        onChange={handleChange}
        helperText="Select the AWS region for your instance"
        required
        error={errors.region}
      />
      
      <SelectField
        id="instanceType"
        label="Instance Type"
        options={instanceTypes}
        value={form.instanceType}
        onChange={handleChange}
        helperText="Select the instance size based on your workload"
        required
        error={errors.instanceType}
      />
      
      <RadioGroup
        id="amiId"
        label="Amazon Machine Image (AMI)"
        options={amiOptions}
        value={form.amiId}
        onChange={(value) => handleRadioChange('amiId', value)}
        helperText="Base image for your instance with security hardening"
        required
      />
      
      {form.amiId === 'ami-custom' && (
        <InputField
          id="customAmiId"
          label="Custom AMI ID"
          value={form.customAmiId || ''}
          onChange={handleChange}
          helperText="Enter your custom AMI ID (e.g., ami-0123456789abcdef0)"
          required
          error={errors.customAmiId}
        />
      )}
    </FormSection>
    
    <FormSection 
      title="Network Configuration" 
      description="Configure network settings for your EC2 instance"
    >
      <SelectField
        id="vpcId"
        label="VPC"
        options={[
          { value: 'default', label: 'Default VPC' },
          { value: 'create-new', label: 'Create New Secure VPC' },
        ]}
        value={form.vpcId}
        onChange={handleChange}
        helperText="Select VPC for your instance"
      />
      
      <SelectField
        id="subnetId"
        label="Subnet"
        options={[
          { value: 'default', label: 'Default Subnet (Public)' },
          { value: 'private', label: 'Private Subnet (Recommended for security)' },
        ]}
        value={form.subnetId}
        onChange={handleChange}
        helperText="Select subnet for your instance"
      />
      
      <InputField
        id="keyPairName"
        label="Key Pair Name"
        value={form.keyPairName}
        onChange={handleChange}
        helperText="Name of the EC2 key pair for SSH access (leave blank to create new)"
      />
      
      <CheckboxField
        id="associatePublicIp"
        label="Associate Public IP Address"
        checked={form.associatePublicIp}
        onChange={handleCheckboxChange}
        helperText="WARNING: Only enable if the instance needs to be directly accessible from the internet"
      />
    </FormSection>
    
    <FormSection 
      title="Storage Configuration" 
      description="Configure storage for your EC2 instance"
    >
      <CheckboxField
        id="ebsEncryption"
        label="Enable EBS Encryption"
        checked={form.ebsEncryption}
        onChange={handleCheckboxChange}
        helperText="Encrypt the root volume for additional security (recommended)"
      />
      
      <InputField
        id="ebsVolumeSize"
        label="EBS Volume Size (GB)"
        type="number"
        value={form.ebsVolumeSize}
        onChange={handleChange}
        helperText="Size of the root volume in GB (minimum 8 GB)"
        error={errors.ebsVolumeSize}
      />
    </FormSection>
    
    <FormSection 
      title="Monitoring and Backup" 
      description="Configure monitoring and backup settings"
    >
      <CheckboxField
        id="backupEnabled"
        label="Enable Automated Backups"
        checked={form.backupEnabled}
        onChange={handleCheckboxChange}
        helperText="Create daily snapshots of your instance"
      />
      
      <RadioGroup
        id="cloudWatchMonitoring"
        label="CloudWatch Monitoring"
        options={monitoringOptions}
        value={form.cloudWatchMonitoring}
        onChange={(value) => handleRadioChange('cloudWatchMonitoring', value)}
        helperText="Select monitoring frequency"
      />
    </FormSection>
    
    <FormSection 
      title="Security Configuration" 
      description="Configure security settings for your EC2 instance"
    >
      <RadioGroup
        id="securityLevel"
        label="Security Level"
        options={securityLevelOptions}
        value={form.securityLevel}
        onChange={(value) => handleRadioChange('securityLevel', value)}
        helperText="Select security level for network access controls"
      />
    </FormSection>
    
    <FormSection 
      title="Scaling Configuration" 
      description="Configure auto scaling for high availability (optional)"
    >
      <CheckboxField
        id="autoScaling"
        label="Enable Auto Scaling"
        checked={form.autoScaling}
        onChange={handleCheckboxChange}
        helperText="Automatically adjust instance count based on load"
      />
      
      {form.autoScaling && (
        <>
          <InputField
            id="minInstances"
            label="Minimum Instances"
            type="number"
            value={form.minInstances}
            onChange={handleChange}
            helperText="Minimum number of instances to maintain"
            error={errors.minInstances}
          />
          
          <InputField
            id="maxInstances"
            label="Maximum Instances"
            type="number"
            value={form.maxInstances}
            onChange={handleChange}
            helperText="Maximum number of instances during high load"
            error={errors.maxInstances}
          />
        </>
      )}
    </FormSection>
    
    <FormSection 
      title="Advanced Configuration" 
      description="Additional configuration options"
    >
      <div className="mb-6">
        <label htmlFor="userData" className="block text-sm font-medium text-gray-700 mb-1">
          User Data Script (Optional)
        </label>
        <textarea
          id="userData"
          value={form.userData}
          onChange={handleTextareaChange}
          rows={6}
          className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
          placeholder="#!/bin/bash&#10;# Add your initialization script here"
        />
        <p className="mt-1 text-sm text-gray-500">
          Bash script to run when the instance launches (for instance configuration)
        </p>
      </div>
    </FormSection>
    
    <div className="mt-10 flex justify-between">
      <button
        type="button"
        onClick={() => router.push('/create')}
        className="bg-white border border-gray-300 px-6 py-3 rounded-md font-medium text-gray-700 hover:bg-gray-50 transition"
      >
        Back
      </button>
      <button
        type="submit"
        className="bg-primary hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition"
      >
        Next: Review
      </button>
    </div>
  </form>
</div>
  );
};

export default EC2Form;
