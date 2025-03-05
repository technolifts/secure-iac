/**
 * S3 result page
 *
 * This page displays the generated Terraform code and provides options
 * to download it or create a new template.
 */

'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { apiClient } from '@/lib/api'
import { S3FormData } from '@/lib/types'
import CodeViewer from '@/components/results/CodeViewer'

export default function S3ResultPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // State for Terraform code
  const [terraformCode, setTerraformCode] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  
  // Parse query parameters to form data
  useEffect(() => {
    const fetchTerraformCode = async () => {
      try {
        // Extract form data from search params
        const bucketName = searchParams.get('bucketName') || ''
        const region = searchParams.get('region') || ''
        const useCase = searchParams.get('useCase') || ''
        const accessControl = searchParams.get('accessControl') || 'bucket_owner'
        const complianceFramework = searchParams.get('complianceFramework')
        const publicAccess = searchParams.get('publicAccess') === 'true'
        
        // Validate required fields
        if (!bucketName || !region || !useCase) {
          setError('Missing required form data. Please go back and fill out the form.')
          setIsLoading(false)
          return
        }
        
        // Prepare form data for API
        const formData: S3FormData = {
          bucket_name: bucketName,
          region,
          use_case: useCase,
          access_control: accessControl as S3FormData['access_control'],
          public_access: publicAccess,
        }
        
        // Add compliance framework if selected
        if (complianceFramework && complianceFramework.length > 0) {
          formData.compliance_framework = complianceFramework.split(',')
        }
        
        // Call API to generate Terraform code
        const response = await apiClient.generateS3Terraform(formData)
        setTerraformCode(response.terraform_code)
        setIsLoading(false)
      } catch (err) {
        console.error('Failed to generate Terraform code:', err)
        setError('Failed to generate Terraform code. Please try again.')
        setIsLoading(false)
      }
    }
    
    fetchTerraformCode()
  }, [searchParams])
  
  // Handle download button click
  const handleDownload = () => {
    // Create a blob with the Terraform code
    const blob = new Blob([terraformCode], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    
    // Create a link element and trigger download
    const link = document.createElement('a')
    link.href = url
    link.download = 'secure_s3_bucket.tf'
    document.body.appendChild(link)
    link.click()
    
    // Clean up
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
  
  // Handle create new button click
  const handleCreateNew = () => {
    router.push('/create')
  }
  
  return (
    <div className="py-10 bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Your Secure S3 Configuration
          </h1>
          <p className="mt-2 text-gray-600">
            Here's your generated Terraform code with security best practices built in.
          </p>
        </div>
        
        {isLoading ? (
          <div className="text-center py-12">
            <svg
              className="animate-spin h-10 w-10 text-primary mx-auto mb-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <p className="text-lg font-medium text-gray-900">Generating secure Terraform code...</p>
            <p className="text-gray-500 mt-2">This might take a few seconds.</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => router.push('/create/s3')}
                    className="btn-primary text-sm"
                  >
                    Go Back to Form
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-white shadow-sm rounded-lg p-6 overflow-hidden">
              <CodeViewer code={terraformCode} />
            </div>
            
            <div className="mt-8 flex justify-between">
              <button
                type="button"
                onClick={() => router.push('/create/s3')}
                className="btn-secondary"
              >
                Back to Form
              </button>
              <div className="space-x-4">
                <button
                  type="button"
                  onClick={handleCreateNew}
                  className="btn-secondary"
                >
                  Create New Template
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="btn-primary"
                >
                  Download Terraform
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}