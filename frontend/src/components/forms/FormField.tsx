/**
 * Form field component
 *
 * This component provides a consistent layout for form fields with labels,
 * help text, and error messages.
 */

import React from 'react'

interface FormFieldProps {
  id: string
  label: string
  children: React.ReactNode
  helpText?: string
  error?: string
  required?: boolean
}

const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  children,
  helpText,
  error,
  required = false
}) => {
  return (
    <div className="mb-6">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      {children}
      
      {helpText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helpText}</p>
      )}
      
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  )
}

export default FormField