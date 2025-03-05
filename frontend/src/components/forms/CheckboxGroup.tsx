/**
 * Checkbox group component
 *
 * This component creates a group of checkboxes with labels and descriptions.
 */

import React from 'react'

export interface CheckboxOption {
  value: string
  label: string
  description?: string
}

interface CheckboxGroupProps {
  id: string
  options: CheckboxOption[]
  values: string[]
  onChange: (values: string[]) => void
}

const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  id,
  options,
  values,
  onChange
}) => {
  const handleChange = (value: string) => {
    if (values.includes(value)) {
      // Remove the value
      onChange(values.filter((v) => v !== value))
    } else {
      // Add the value
      onChange([...values, value])
    }
  }
  
  return (
    <div className="space-y-3">
      {options.map((option) => (
        <div key={option.value} className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id={`${id}-${option.value}`}
              name={`${id}-${option.value}`}
              type="checkbox"
              checked={values.includes(option.value)}
              onChange={() => handleChange(option.value)}
              className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
            />
          </div>
          <div className="ml-3">
            <label htmlFor={`${id}-${option.value}`} className="text-sm font-medium text-gray-700">
              {option.label}
            </label>
            {option.description && (
              <p className="text-sm text-gray-500">{option.description}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default CheckboxGroup