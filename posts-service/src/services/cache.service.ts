import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { createClient } from 'redis';

@Injectable()
export class CacheService implements OnModuleInit, OnModuleDestroy {
  private client: ReturnType<typeof createClient>;

  async onModuleInit() {
    this.client = await createClient({
      url: process.env.REDIS_URI,
    }).connect();
  }

  async onModuleDestroy() {
    await this.client.disconnect();
  }

  async set(key: string, data: string, ttlInSeconds?: number): Promise<void> {
    await this.client.set(key, data, { EX: ttlInSeconds });
  }

  async setMany(data: Record<string, string>): Promise<void> {
    await this.client.mSet(data);
  }

  async get(key: string): Promise<string> {
    return this.client.get(key);
  }

  async getMany(keys: string[]): Promise<string[]> {
    return this.client.mGet(keys);
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async addOnList(key: string, data: string): Promise<void> {
    await this.client.lPush(key, data);
  }
}
