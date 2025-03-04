// frontend/src/services/api.ts
import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';

// Define response types for better type safety
export interface HealthCheckResponse {
  status: string;
}

export interface TemplateResponse {
  id: string;
  service_type: string;
  template: string;
  created_at: string;
  // Add other template response fields as needed
}

export type RequirementValue = string | number | boolean;

export interface TemplateRequirements {
  [key: string]: RequirementValue;
}

class ApiClient {
  private client: AxiosInstance;
  private static instance: ApiClient;

  private constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        // Handle error cases
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  // Singleton pattern
  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  // Health check
  async healthCheck(): Promise<HealthCheckResponse> {
    const response: AxiosResponse<HealthCheckResponse> = await this.client.get('/health');
    return response.data;
  }

  // Generate template
  async generateTemplate(serviceType: string, requirements: TemplateRequirements): Promise<TemplateResponse> {
    const response: AxiosResponse<TemplateResponse> = await this.client.post('/api/v1/templates', {
      service_type: serviceType,
      requirements,
    });
    return response.data;
  }
}

// Create a server-side safe API client factory
export const createApiClient = () => {
  return ApiClient.getInstance();
};

// For client components
let clientSideApiClient: ApiClient | null = null;

// This function should only be used in client components
export function getClientApiClient() {
  if (typeof window === 'undefined') {
    throw new Error('getClientApiClient should only be called from client components');
  }
  
  if (!clientSideApiClient) {
    clientSideApiClient = ApiClient.getInstance();
  }
  
  return clientSideApiClient;
}