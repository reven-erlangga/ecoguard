import { Injectable } from '@nestjs/common';

@Injectable()
export class MentionsService {
  private readonly baseUrl = 'https://api.x.com/2';
  // Ambil token dari environment variable
  private readonly bearerToken = process.env.X_BEARER_TOKEN;
  // Ambil username dari environment variable
  private readonly xUsername = process.env.X_USERNAME;

  /**
   * Mengambil mention untuk user tertentu.
   * Jika userId adalah 'me', sistem akan otomatis mencari ID berdasarkan X_USERNAME di .env
   */
  async getMentions(userId: string = 'me') {
    if (!this.bearerToken) {
      throw new Error('X_BEARER_TOKEN is not set in environment variables');
    }

    let targetId = userId;

    // Jika 'me', kita bypass dengan mencari ID berdasarkan username
    if (userId === 'me') {
      if (!this.xUsername) {
        throw new Error('X_USERNAME is not set in environment variables but userId is "me"');
      }
      targetId = await this.getUserIdByUsername(this.xUsername);
    }

    const url = `${this.baseUrl}/users/${targetId}/mentions`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.bearerToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`X API Error: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching mentions from X (Twitter):', error.message);
      throw error;
    }
  }

  /**
   * Helper untuk mengambil User ID berdasarkan Username
   * Endpoint: https://api.x.com/2/users/by/username/{username}
   */
  private async getUserIdByUsername(username: string): Promise<string> {
    const url = `${this.baseUrl}/users/by/username/${username}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.bearerToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`X API Error (GetUserID): ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const result = await response.json();
      
      if (!result.data || !result.data.id) {
        throw new Error(`User with username ${username} not found`);
      }

      return result.data.id;
    } catch (error) {
      console.error(`Error fetching user ID for ${username}:`, error.message);
      throw error;
    }
  }
}
