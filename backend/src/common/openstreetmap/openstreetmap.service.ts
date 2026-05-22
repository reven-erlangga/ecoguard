import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { RedisCacheService } from '../redis/redis-cache.service';

@Injectable()
export class OpenstreetmapService {
  private readonly baseUrl = 'https://nominatim.openstreetmap.org/search';

  constructor(private readonly redisCacheService: RedisCacheService) {}

  /**
   * Get coordinates for a location name
   * @param locationName Name of the location (e.g., "Jakarta")
   * @returns Coordinates or null if not found
   */
  async getCoordinates(locationName: string): Promise<{ latitude: number; longitude: number; displayName: string } | null> {
    const sanitizedLocation = locationName.toLowerCase().trim();
    if (!sanitizedLocation) return null;

    const cacheKey = `geocoding:${sanitizedLocation}`;

    // 1. Try to fetch from Redis Cache
    try {
      const cachedData = await this.redisCacheService.get(cacheKey);
      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        console.log(`🚀 [Cache Hit] Serving coordinates for "${locationName}" from Redis Cloud!`);
        return parsed;
      }
    } catch (e) {
      console.warn('⚠️ Failed to read or parse geocoding cache from Redis. Falling back to direct API.', e.message);
    }

    // 2. Cache Miss - Fetch from OpenStreetMap Nominatim
    try {
      console.log(`🌐 [Cache Miss] Fetching coordinates for "${locationName}" from OpenStreetMap Nominatim...`);
      // Nominatim requires a valid User-Agent to avoid blocking
      const response = await fetch(
        `${this.baseUrl}?format=json&q=${encodeURIComponent(locationName)}&limit=1`,
        {
          headers: {
            'User-Agent': 'NestJS-Backend-Simulation/1.0',
          },
        }
      );

      if (!response.ok) {
        throw new HttpException(
          'Failed to fetch from OpenStreetMap',
          HttpStatus.BAD_GATEWAY,
        );
      }

      const data = await response.json();

      if (data && data.length > 0) {
        const result = {
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon),
          displayName: data[0].display_name,
        };

        // 3. Save result to Redis Cache (expires in 7 days)
        await this.redisCacheService.set(cacheKey, JSON.stringify(result), 604800);
        console.log(`💾 [Cache Set] Coordinates for "${locationName}" cached in Redis Cloud.`);

        return result;
      }

      return null;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.error('OpenStreetMap Geocoding Error:', error);
      throw new HttpException(
        'Internal Server Error in Geocoding',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

