import { Module } from '@nestjs/common';
import { OpenstreetmapService } from './openstreetmap.service';
import { RedisCacheModule } from '../redis/redis-cache.module';

@Module({
  imports: [RedisCacheModule],
  providers: [OpenstreetmapService],
  exports: [OpenstreetmapService],
})
export class OpenstreetmapModule {}

