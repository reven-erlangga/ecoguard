import { Module } from '@nestjs/common';
import { PharapraseService } from './pharaprase.service';

@Module({
  providers: [PharapraseService],
  exports: [PharapraseService],
})
export class PharapraseModule {}
