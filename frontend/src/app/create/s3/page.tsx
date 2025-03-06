/**
 * S3 bucket configuration form page
 *
 * This page contains a form for configuring an S3 bucket with
 * security options and requirements.
 */

'use client'

import React, { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import FormField from '@/components/forms/FormField'
import RadioGroup from '@/components/forms/RadioGroup'
import CheckboxGroup from '@/components/forms/CheckboxGroup'

// Define AWS regions
const awsRegions = [
  { value: 'us-east-1', label: 'US East (N. Virginia)' },
  { value: 'us-east-2', label: 'US East (Ohio)' },
  { value: 'us-west-1', label: 'US West (N. California)' },
  { value: 'us-west-2', label: 'US West (Oregon)' },
  { value: 'eu-west-1', label: 'EU (Ireland)' },
  { value: 'eu-central-1', label: 'EU (Frankfurt)' },
]

// Define access control options
const accessControlOptions = [
  { 
    value: 'bucket_owner', 
    label: 'Bucket Owner Only', 
    description: 'Only the bucket owner can access the objects (most secure)' 
  },
  { 
    value: 'authenticated_users', 
    label: 'Authenticated AWS Users', 
    description: 'Any authenticated AWS user can access the objects' 
  },
  { 
    value: 'object_owner_control', 
    label: 'Object Owner Control', 
    description: 'Object owner controls write access, bucket owner has read access' 
  },
]

// Define compliance framework options
const complianceOptions = [
  { 
    value: 'hipaa', 
    label: 'HIPAA', 
    description: 'Health Insurance Portability and Accountability Act' 
  },
  { 
    value: 'pci_dss', 
    label: 'PCI DSS', 
    description: 'Payment Card Industry Data Security Standard' 
  },
]

// Define public access options
const publicAccessOptions = [
  { 
    value: 'false', 
    label: 'No, keep it private (recommended)', 
    description: 'The bucket should not be accessible from the internet' 
  },
  { 
    value: 'true', 
    label: 'Yes, it needs to be public', 
    description: 'WARNING: Makes bucket content potentially accessible to anyone' 
  },
]

export default function S3Form() {
  const router = useRouter()
  
  // Form state
  const [form, setForm] = useState({
    bucketName: '',
    region: 'us-east-1',
    useCase: '',
    accessControl: 'bucket_owner',
    complianceFramework: [] as string[],
    publicAccess: 'false'
  })
  
  // Error state
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  // Loading state
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }
  
  // Handle radio input changes
  const handleRadioChange = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }))
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }
  
  // Handle checkbox group changes
  const handleCheckboxGroupChange = (name: string, values: string[]) => {
    setForm((prev) => ({ ...prev, [name]: values }))
  }
  
  // Form validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!form.bucketName.trim()) {
      newErrors.bucketName = 'Bucket name is required'
    } else if (!/^[a-z0-9.-]{3,63}$/.test(form.bucketName)) {
      newErrors.bucketName = 'Bucket name must be between 3 and 63 characters, and can only contain lowercase letters, numbers, periods, and hyphens'
    }
    
    if (!form.useCase.trim()) {
      newErrors.useCase = 'Use case description is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    // Validate form
    if (!validateForm()) {
      return
    }
    
    // Set loading state
    setIsSubmitting(true)
    
    try {
      // Navigate to results page with form data
      // In a full implementation, we would submit to the API here
      // and then navigate on success
      const searchParams = new URLSearchParams({
        bucketName: form.bucketName,
        region: form.region,
        useCase: form.useCase,
        accessControl: form.accessControl,
        complianceFramework: form.complianceFramework.join(','),
        publicAccess: form.publicAccess
      }).toString()
      
      router.push(`/create/s3/result?${searchParams}`)
    } catch (error) {
      console.error('Form submission error:', error)
      setIsSubmitting(false)
    }
  }
  
  return (
    <div className="py-10 bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Configure S3 Bucket
          </h1>
          <p className="mt-2 text-gray-600">
            Configure your secure S3 bucket with the parameters below. Security best practices will be applied automatically.
          </p>
        </div>
        
        <div className="bg-white shadow-sm rounded-lg p-6">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <FormField
                id="bucketName"
                label="Bucket Name"
                required
                helpText="Must be globally unique, lowercase, and between 3-63 characters"
                error={errors.bucketName}
              >
                <input
                  type="text"
                  id="bucketName"
                  name="bucketName"
                  value={form.bucketName}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  required
                />
              </FormField>
              
              <FormField
                id="region"
                label="AWS Region"
                required
              >
                <select
                  id="region"
                  name="region"
                  value={form.region}
                  onChange={handleChange}
                  className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  required
                >
                  {awsRegions.map((region) => (
                    <option key={region.value} value={region.value}>
                      {region.label}
                    </option>
                  ))}
                </select>
              </FormField>
              
              <FormField
                id="useCase"
                label="What will this S3 bucket be used for?"
                required
                helpText="Describe your use case to help us generate the most appropriate configuration"
                error={errors.useCase}
              >
                <textarea
                  id="useCase"
                  name="useCase"
                  value={form.useCase}
                  onChange={handleChange}
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  required
                />
              </FormField>
              
              <FormField
                id="accessControl"
                label="Who needs to access the bucket?"
                required
              >
                <RadioGroup
                  id="accessControl"
                  options={accessControlOptions}
                  value={form.accessControl}
                  onChange={(value) => handleRadioChange('accessControl', value)}
                  required
                />
              </FormField>
              
              <FormField
                id="complianceFramework"
                label="Do you need to follow a compliance framework?"
                helpText="Select all that apply"
              >
                <CheckboxGroup
                  id="complianceFramework"
                  options={complianceOptions}
                  values={form.complianceFramework}
                  onChange={(values) => handleCheckboxGroupChange('complianceFramework', values)}
                />
              </FormField>
              
              <FormField
                id="publicAccess"
                label="Does this bucket absolutely need to be accessible to the internet?"
                required
              >
                <RadioGroup
                  id="publicAccess"
                  options={publicAccessOptions}
                  value={form.publicAccess}
                  onChange={(value) => handleRadioChange('publicAccess', value)}
                  required
                />
              </FormField>
            </div>
            
            <div className="mt-8 flex justify-between">
              <button
                type="button"
                onClick={() => router.push('/create')}
                className="btn-secondary"
              >
                Back
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Generating...' : 'Generate Terraform'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}