import React, { createContext, useContext, useState, ReactNode } from 'react';

interface FormContextType {
  formData: Record<string, any>;
  updateFormData: (serviceType: string, data: Record<string, any>) => void;
  clearFormData: () => void;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

export function FormProvider({ children }: { children: ReactNode }) {
  const [formData, setFormData] = useState<Record<string, any>>({
    s3: {},
    ec2: {},
    vpc: {}
  });

  const updateFormData = (serviceType: string, data: Record<string, any>) => {
    setFormData(prev => ({
      ...prev,
      [serviceType]: {
        ...prev[serviceType],
        ...data
      }
    }));
  };

  const clearFormData = () => {
    setFormData({
      s3: {},
      ec2: {},
      vpc: {}
    });
  };

  return (
    <FormContext.Provider value={{ formData, updateFormData, clearFormData }}>
      {children}
    </FormContext.Provider>
  );
}

export function useFormContext() {
  const context = useContext(FormContext);
  if (context === undefined) {
    throw new Error('useFormContext must be used within a FormProvider');
  }
  return context;
}