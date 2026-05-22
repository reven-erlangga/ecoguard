import { Module } from '@nestjs/common';
import { TwitterConfigService } from './twitter-config.service';
import { TwitterController } from './twitter.controller';

@Module({
  controllers: [TwitterController],
  providers: [TwitterConfigService],
  exports: [TwitterConfigService],
})
export class TwitterModule {}
