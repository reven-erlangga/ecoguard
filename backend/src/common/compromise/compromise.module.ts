import { Module } from '@nestjs/common';
import { CompromiseService } from './compromise.service';

@Module({
  providers: [CompromiseService],
  exports: [CompromiseService],
})
export class CompromiseModule {}
