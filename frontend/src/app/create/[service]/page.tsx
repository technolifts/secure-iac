import { Metadata } from 'next';
import React from 'react';
import S3Form from '../../../components/forms/S3Form';
import EC2Form from '../../../components/forms/EC2Form';
import { FormProvider } from '../../../context/FormContext';

// Define params type with the Promise wrapper
type ServiceParams = {
  service: string;
};

// Generate metadata asynchronously
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<ServiceParams> 
}): Promise<Metadata> {
  const resolvedParams = await params;
  return {
    title: `Configure ${resolvedParams.service.toUpperCase()} - Secure IaC`,
    description: `Generate secure infrastructure as code template for ${resolvedParams.service.toUpperCase()}`,
  };
}

// Service page component
export default function ServicePage({ 
    params 
  }: { 
    params: ServiceParams 
  }) {
    const getServiceForm = (service: string) => {
      switch (service) {
        case 's3':
          return <S3Form />;
        case 'ec2':
          return <EC2Form />;
        default:
          return (
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <p className="text-gray-600">Configuration options for {service.toUpperCase()} will be displayed here.</p>
            </div>
          );
      }
    };
  
    return (
      <FormProvider>
        <div className="max-w-4xl mx-auto">
          {getServiceForm(params.service)}
        </div>
      </FormProvider>
    );
  }