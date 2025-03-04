import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useFormContext } from '../../context/FormContext';
import { 
  InputField, 
  SelectField, 
  CheckboxField, 
  RadioGroup,
  FormSection
} from '../../components/forms/FormComponents';

const S3Form: React.FC = () => {
  const router = useRouter();
  const { formData, updateFormData } = useFormContext();
  
  // Initial form state from context or defaults
  const [form, setForm] = useState({
    bucketName: formData.s3.bucketName || '',
    region: formData.s3.region || '',
    accessControl: formData.s3.accessControl || 'private',
    encryption: formData.s3.encryption || 'AES256',
    versioningEnabled: formData.s3.versioningEnabled || false,
    loggingEnabled: formData.s3.loggingEnabled || true,
    publicAccessEnabled: formData.s3.publicAccessEnabled || false,
    lifecycleRules: formData.s3.lifecycleRules || 'none',
    corsEnabled: formData.s3.corsEnabled || false,
    allowedOrigins: formData.s3.allowedOrigins || '',
    complianceType: formData.s3.complianceType || 'standard',
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
  
  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!form.bucketName) {
      newErrors.bucketName = 'Bucket name is required';
    } else if (!/^[a-z0-9.-]{3,63}$/.test(form.bucketName)) {
      newErrors.bucketName = 'Bucket name must be between 3 and 63 characters, and can only contain lowercase letters, numbers, periods, and hyphens';
    }
    
    if (!form.region) {
      newErrors.region = 'Region is required';
    }
    
    if (form.corsEnabled && !form.allowedOrigins) {
      newErrors.allowedOrigins = 'Allowed origins are required when CORS is enabled';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Save form data to context
      updateFormData('s3', form);
      
      // Navigate to the next step
      router.push('/create/s3/review');
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
  
  const accessControlOptions = [
    { value: 'private', label: 'Private', description: 'Only the bucket owner can access the objects (most secure)' },
    { value: 'authenticated-read', label: 'Authenticated Read', description: 'Only authenticated AWS users can access the objects' },
    { value: 'bucket-owner-read', label: 'Bucket Owner Read', description: 'Object owner controls write access, bucket owner has read access' },
  ];
  
  const encryptionOptions = [
    { value: 'AES256', label: 'Amazon S3-managed keys (SSE-S3)', description: 'Server-side encryption with S3 managed keys' },
    { value: 'aws:kms', label: 'AWS KMS keys (SSE-KMS)', description: 'Server-side encryption with KMS managed keys (more control)' },
  ];
  
  const lifecycleOptions = [
    { value: 'none', label: 'None', description: 'No lifecycle rules' },
    { value: 'archive', label: 'Archive older objects', description: 'Move objects older than 90 days to Glacier' },
    { value: 'expire', label: 'Expire older objects', description: 'Delete objects older than 1 year' },
    { value: 'archive-expire', label: 'Archive then expire', description: 'Move to Glacier after 90 days, delete after 1 year' },
  ];
  
  const complianceOptions = [
    { value: 'standard', label: 'Standard', description: 'Basic security best practices' },
    { value: 'hipaa', label: 'HIPAA', description: 'Health Insurance Portability and Accountability Act' },
    { value: 'pci', label: 'PCI DSS', description: 'Payment Card Industry Data Security Standard' },
  ];
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Configure S3 Bucket</h1>
        <p className="text-lg text-gray-600">
          Configure your secure S3 bucket with the parameters below. Security best practices will be applied automatically.
        </p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <FormSection 
          title="Basic Information" 
          description="Provide the basic details for your S3 bucket"
        >
          <InputField
            id="bucketName"
            label="Bucket Name"
            value={form.bucketName}
            onChange={handleChange}
            helperText="Must be globally unique, lowercase, and between 3-63 characters"
            required
            error={errors.bucketName}
          />
          
          <SelectField
            id="region"
            label="Region"
            options={regions}
            value={form.region}
            onChange={handleChange}
            helperText="Select the AWS region where your bucket will be created"
            required
            error={errors.region}
          />
        </FormSection>
        
        <FormSection 
          title="Security Configuration" 
          description="Configure the security settings for your S3 bucket"
        >
          <RadioGroup
            id="accessControl"
            label="Access Control"
            options={accessControlOptions}
            value={form.accessControl}
            onChange={(value) => handleRadioChange('accessControl', value)}
            helperText="Determines who can access objects in the bucket"
            required
          />
          
          <RadioGroup
            id="encryption"
            label="Server-Side Encryption"
            options={encryptionOptions}
            value={form.encryption}
            onChange={(value) => handleRadioChange('encryption', value)}
            helperText="Encrypt data at rest in S3"
            required
          />
          
          <CheckboxField
            id="versioningEnabled"
            label="Enable Versioning"
            checked={form.versioningEnabled}
            onChange={handleCheckboxChange}
            helperText="Keep multiple versions of an object to protect against accidental deletion and for compliance"
          />
          
          <CheckboxField
            id="loggingEnabled"
            label="Enable Access Logging"
            checked={form.loggingEnabled}
            onChange={handleCheckboxChange}
            helperText="Track requests made to the bucket for security analysis and auditing"
          />
          
          <CheckboxField
            id="publicAccessEnabled"
            label="Allow Public Access"
            checked={form.publicAccessEnabled}
            onChange={handleCheckboxChange}
            helperText="WARNING: Not recommended for sensitive data. Enabling this will make your data potentially accessible to anyone."
          />
        </FormSection>
        
        <FormSection 
          title="Advanced Configuration" 
          description="Configure additional features for your S3 bucket"
        >
          <RadioGroup
            id="lifecycleRules"
            label="Lifecycle Rules"
            options={lifecycleOptions}
            value={form.lifecycleRules}
            onChange={(value) => handleRadioChange('lifecycleRules', value)}
            helperText="Define how objects are managed over time"
          />
          
          <CheckboxField
            id="corsEnabled"
            label="Enable CORS (Cross-Origin Resource Sharing)"
            checked={form.corsEnabled}
            onChange={handleCheckboxChange}
            helperText="Allow web applications from other domains to access your bucket"
          />
          
          {form.corsEnabled && (
            <InputField
              id="allowedOrigins"
              label="Allowed Origins"
              value={form.allowedOrigins}
              onChange={handleChange}
              helperText="Comma-separated list of domains (e.g., https://example.com,https://test.com)"
              error={errors.allowedOrigins}
            />
          )}
          
          <RadioGroup
            id="complianceType"
            label="Compliance Framework"
            options={complianceOptions}
            value={form.complianceType}
            onChange={(value) => handleRadioChange('complianceType', value)}
            helperText="Apply additional security controls based on compliance requirements"
          />
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

export default S3Form;