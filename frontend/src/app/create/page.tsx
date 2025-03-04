'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

const services = [
  { id: 's3', name: 'S3 Storage', description: 'Secure object storage buckets' },
  { id: 'ec2', name: 'EC2 Compute', description: 'Secure virtual machines' },
  { id: 'vpc', name: 'VPC Networking', description: 'Secure network infrastructure' },
];

export default function CreateTemplate() {
  const router = useRouter();
  
  const handleSelectService = (serviceId: string) => {
    router.push(`/create/${serviceId}`);
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Select AWS Service</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {services.map((service) => (
          <div 
            key={service.id}
            className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition cursor-pointer"
            onClick={() => handleSelectService(service.id)}
          >
            <h2 className="text-xl font-semibold mb-2">{service.name}</h2>
            <p className="text-gray-600">{service.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}