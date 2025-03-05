/**
 * API client
 *
 * This module provides a client for interacting with the backend API.
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import { S3FormData, TerraformResponse } from './types';

class ApiClient {
  private client: AxiosInstance;
  
  constructor() {
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
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }
  
  // Health check endpoint
  async healthCheck(): Promise<{ status: string }> {
    const response = await this.client.get('/health');
    return response.data;
  }
  
  // Generate S3 Terraform endpoint
  async generateS3Terraform(formData: S3FormData): Promise<TerraformResponse> {
    const response = await this.client.post('/api/v1/generate/s3', formData);
    return response.data;
  }
}

// Export a singleton instance
export const apiClient = new ApiClient();