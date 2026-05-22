import { Module } from '@nestjs/common';
import { DbscanService } from './dbscan.service';

@Module({
  providers: [DbscanService],
  exports: [DbscanService],
})
export class DbscanModule {}
