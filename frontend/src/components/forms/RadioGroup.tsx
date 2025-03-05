/**
 * Radio group component
 *
 * This component creates a group of radio buttons with labels and descriptions.
 */

import React from 'react'

export interface RadioOption {
  value: string
  label: string
  description?: string
}

interface RadioGroupProps {
  id: string
  options: RadioOption[]
  value: string
  onChange: (value: string) => void
  required?: boolean
}

const RadioGroup: React.FC<RadioGroupProps> = ({
  id,
  options,
  value,
  onChange,
  required = false
}) => {
  return (
    <div className="space-y-3">
      {options.map((option) => (
        <div key={option.value} className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id={`${id}-${option.value}`}
              name={id}
              type="radio"
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
              required={required}
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

export default RadioGroup