import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisCacheService implements OnModuleInit, OnModuleDestroy {
  private redisClient: Redis | null = null;
  private isConnected = false;

  onModuleInit() {
    const host = process.env.REDIS_HOST;
    const portStr = process.env.REDIS_PORT;
    const password = process.env.REDIS_PASSWORD;

    if (!host) {
      console.warn('REDIS_HOST env variable is not set. Redis caching is disabled.');
      return;
    }

    try {
      this.redisClient = new Redis({
        host,
        port: portStr ? parseInt(portStr, 10) : 6379,
        password: password || undefined,
        maxRetriesPerRequest: 1,
        connectTimeout: 5000, // 5 seconds connect timeout
      });

      this.redisClient.on('connect', () => {
        this.isConnected = true;
        console.log('Successfully connected to Redis Cloud!');
      });

      this.redisClient.on('error', (err) => {
        this.isConnected = false;
        console.warn('Redis connection error. Falling back to direct API. Error:', err.message);
      });
    } catch (e) {
      console.warn('Failed to initialize Redis client. Caching disabled.', e);
    }
  }

  async get(key: string): Promise<string | null> {
    if (!this.redisClient || !this.isConnected) {
      return null;
    }
    try {
      return await this.redisClient.get(key);
    } catch (e) {
      console.warn('Failed to get key from Redis:', e.message);
      return null;
    }
  }

  async set(key: string, value: string, ttlSeconds = 604800): Promise<void> {
    if (!this.redisClient || !this.isConnected) {
      return;
    }
    try {
      await this.redisClient.set(key, value, 'EX', ttlSeconds);
    } catch (e) {
      console.warn('Failed to set key in Redis:', e.message);
    }
  }

  onModuleDestroy() {
    if (this.redisClient) {
      this.redisClient.disconnect();
    }
  }
}
