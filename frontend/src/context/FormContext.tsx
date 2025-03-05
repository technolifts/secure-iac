'use client';
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface EC2FormData {
  instanceName?: string;
  region?: string;
  instanceType?: string;
  amiId?: string;
  customAmiId?: string;
  vpcId?: string;
  subnetId?: string;
  keyPairName?: string;
  associatePublicIp?: boolean;
  ebsEncryption?: boolean;
  ebsVolumeSize?: string;
  backupEnabled?: boolean;
  cloudWatchMonitoring?: string;
  securityLevel?: string;
  autoScaling?: boolean;
  minInstances?: string;
  maxInstances?: string;
  userData?: string;
}

interface S3FormData {
  bucketName?: string;
  region?: string;
  accessControl?: string;
  encryption?: string;
  versioningEnabled?: boolean;
  loggingEnabled?: boolean;
  publicAccessEnabled?: boolean;
  lifecycleRules?: string;
  corsEnabled?: boolean;
  allowedOrigins?: string;
  complianceType?: string;
}

interface VPCFormData {
  // Add VPC form fields as needed
}

interface FormData {
  ec2: EC2FormData;
  s3: S3FormData;
  vpc: VPCFormData;
}

interface FormContextType {
  formData: FormData;
  updateFormData: (serviceType: keyof FormData, data: Partial<FormData[keyof FormData]>) => void;
  clearFormData: () => void;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

export function FormProvider({ children }: { children: ReactNode }) {
  const [formData, setFormData] = useState<FormData>({
    s3: {},
    ec2: {},
    vpc: {}
  });

  const updateFormData = (serviceType: keyof FormData, data: Partial<FormData[keyof FormData]>) => {
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