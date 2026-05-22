import { Module } from '@nestjs/common';
import { NormalizeService } from './normalize/normalize.service';
import { FuzzyMatchService } from './fuzzy-match/fuzzy-match.service';

@Module({
  providers: [NormalizeService, FuzzyMatchService],
  exports: [NormalizeService, FuzzyMatchService],
})
export class LocationParserModule {}
