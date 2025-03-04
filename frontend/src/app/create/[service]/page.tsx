import { Metadata } from 'next';
import React from 'react';

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
export default async function ServicePage({ 
  params 
}: { 
  params: Promise<ServiceParams> 
}) {
  const resolvedParams = await params;
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Configure {resolvedParams.service.toUpperCase()} Template</h1>
      
      {/* Service specific form will go here */}
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
        <p className="text-gray-600">Configuration options for {resolvedParams.service.toUpperCase()} will be displayed here.</p>
      </div>
    </div>
  );
}