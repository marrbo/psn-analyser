// lib/fusionauth.ts
import { FusionAuthUser, FusionAuthResponse } from '@/types/fusionauth';

export class FusionAuthService {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = process.env.FUSIONAUTH_URL!;
    this.apiKey = process.env.FUSIONAUTH_API_KEY!;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`FusionAuth API error: ${response.statusText}`);
    }

    return response.json();
  }

  async getUserById(userId: string): Promise<FusionAuthUser> {
    const response = await this.request(`/api/user/${userId}`);
    return response.user;
  }

  async updateUser(userId: string, userData: Partial<FusionAuthUser>) {
    return this.request(`/api/user/${userId}`, {
      method: 'PUT',
      body: JSON.stringify({ user: userData }),
    });
  }

  async registerUser(userData: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }) {
    return this.request('/api/user/registration', {
      method: 'POST',
      body: JSON.stringify({
        registration: {
          applicationId: process.env.FUSIONAUTH_APPLICATION_ID,
        },
        user: userData,
        skipVerification: false,
      }),
    });
  }

  async searchUsers(query: string) {
    return this.request('/api/user/search', {
      method: 'POST',
      body: JSON.stringify({
        search: {
          query,
          numberOfResults: 10,
        },
      }),
    });
  }
}

export const fusionAuth = new FusionAuthService();