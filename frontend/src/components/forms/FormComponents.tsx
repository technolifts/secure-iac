import React, { ReactNode } from 'react';

// Input field
interface InputFieldProps {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  helperText?: string;
  required?: boolean;
  error?: string;
}

export const InputField: React.FC<InputFieldProps> = ({
  id,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  helperText,
  required = false,
  error
}) => {
  return (
    <div className="mb-6">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full p-3 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-primary focus:border-primary`}
        required={required}
      />
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

// Select field
interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  id: string;
  label: string;
  options: SelectOption[];
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  helperText?: string;
  required?: boolean;
  error?: string;
}

export const SelectField: React.FC<SelectFieldProps> = ({
  id,
  label,
  options,
  value,
  onChange,
  helperText,
  required = false,
  error
}) => {
  return (
    <div className="mb-6">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        id={id}
        value={value}
        onChange={onChange}
        className={`w-full p-3 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-primary focus:border-primary`}
        required={required}
      >
        <option value="">Select an option</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

// Checkbox field
interface CheckboxFieldProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  helperText?: string;
}

export const CheckboxField: React.FC<CheckboxFieldProps> = ({
  id,
  label,
  checked,
  onChange,
  helperText
}) => {
  return (
    <div className="mb-6">
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            id={id}
            type="checkbox"
            checked={checked}
            onChange={onChange}
            className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
          />
        </div>
        <div className="ml-3">
          <label htmlFor={id} className="text-sm font-medium text-gray-700">
            {label}
          </label>
          {helperText && (
            <p className="text-sm text-gray-500">{helperText}</p>
          )}
        </div>
      </div>
    </div>
  );
};

// Radio group
interface RadioOption {
  value: string;
  label: string;
  description?: string;
}

interface RadioGroupProps {
  id: string;
  label: string;
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  helperText?: string;
  required?: boolean;
  error?: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  id,
  label,
  options,
  value,
  onChange,
  helperText,
  required = false,
  error
}) => {
  return (
    <div className="mb-6">
      <label className="text-sm font-medium text-gray-700 block mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
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
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

// Form section
interface FormSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export const FormSection: React.FC<FormSectionProps> = ({
  title,
  description,
  children
}) => {
  return (
    <div className="mb-10">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        {description && (
          <p className="mt-1 text-gray-600">{description}</p>
        )}
      </div>
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
};