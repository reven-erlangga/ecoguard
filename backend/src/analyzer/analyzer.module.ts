import { Module } from '@nestjs/common';
import { AnalyzerService } from './analyzer.service';
import { CompromiseModule } from '../common/compromise/compromise.module';
import { DbscanModule } from '../common/dbscan/dbscan.module';
import { LocationParserModule } from '../common/location-parser/location-parser.module';
import { OpenstreetmapModule } from '../common/openstreetmap/openstreetmap.module';
import { ClusteringModule } from '../common/clustering/clustering.module';
import { TranslateModule } from '../common/translate/translate.module';
import { PharapraseModule } from '../common/pharaprase/pharaprase.module';
import { IssueModule } from '../issue/issue.module';

@Module({
  imports: [
    CompromiseModule,
    DbscanModule,
    LocationParserModule,
    OpenstreetmapModule,
    ClusteringModule,
    TranslateModule,
    PharapraseModule,
    IssueModule,
  ],
  providers: [AnalyzerService],
  exports: [AnalyzerService],
})
export class AnalyzerModule {}
