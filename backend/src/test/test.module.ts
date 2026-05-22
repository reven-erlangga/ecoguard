import { Module } from '@nestjs/common';
import { TestController } from './test.controller';
import { TestService } from './test.service';
import { CompromiseModule } from '../common/compromise/compromise.module';
import { DbscanModule } from '../common/dbscan/dbscan.module';
import { LocationParserModule } from '../common/location-parser/location-parser.module';
import { OpenstreetmapModule } from '../common/openstreetmap/openstreetmap.module';
import { AnalyzerModule } from '../analyzer/analyzer.module';

@Module({
  imports: [
    CompromiseModule,
    DbscanModule,
    LocationParserModule,
    OpenstreetmapModule,
    AnalyzerModule,
  ],
  controllers: [TestController],
  providers: [TestService],
})
export class TestModule {}
