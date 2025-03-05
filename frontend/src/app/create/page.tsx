/**
 * Service selection page
 *
 * This page displays tiles for the different AWS services that users can
 * create secure templates for. Currently, only S3 is active with others
 * marked as "Coming Soon".
 */

import Link from 'next/link'
import React from 'react'

// Service card component
interface ServiceCardProps {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  comingSoon?: boolean
}

const ServiceCard: React.FC<ServiceCardProps> = ({ id, name, description, icon, comingSoon = false }) => {
    const cardClasses = "border rounded-lg p-6 hover:shadow-lg transition " + 
      (comingSoon ? "opacity-60 cursor-not-allowed" : "cursor-pointer transform hover:-translate-y-1");
    
    const content = (
      <div className={cardClasses}>
        <div className="flex items-center mb-4">
          <div className="mr-4 text-primary">{icon}</div>
          <h2 className="text-xl font-semibold">{name}</h2>
        </div>
        <p className="text-gray-600 mb-4">{description}</p>
        <div className="mt-2">
          {comingSoon ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              Coming Soon
            </span>
          ) : (
            <span className="text-primary font-medium inline-flex items-center">
              Configure
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          )}
        </div>
      </div>
    )
    
    if (comingSoon) {
      return content;
    }
    
    return (
      <Link href={`/create/${id}`}>
        {content}
      </Link>
    )
  }
  
  export default function CreatePage() {
    // Service definitions
    const services = [
      {
        id: 's3',
        name: 'S3 Storage',
        description: 'Secure object storage with encryption, access controls, and lifecycle policies',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
        ),
        comingSoon: false,
      },
      {
        id: 'ec2',
        name: 'EC2 Compute',
        description: 'Secure virtual machines with hardened configurations and proper security groups',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
          </svg>
        ),
        comingSoon: true,
      },
      {
        id: 'vpc',
        name: 'VPC Networking',
        description: 'Secure network architecture with proper segmentation and security controls',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
          </svg>
        ),
        comingSoon: true,
      }
    ];
  
    return (
      <div className="py-10 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Select AWS Service
            </h1>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
              Choose the AWS service you want to create a secure infrastructure template for
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                id={service.id}
                name={service.name}
                description={service.description}
                icon={service.icon}
                comingSoon={service.comingSoon}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }