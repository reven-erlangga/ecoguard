import { Module } from '@nestjs/common';
import { MentionsService } from './mentions/mentions.service';
import { MentionsStreamService } from './mentions/mentions-stream.service';
import { TwitterModule } from '../../configuration/twitter/twitter.module';
import { AnalyzerModule } from '../../analyzer/analyzer.module';

@Module({
  imports: [TwitterModule, AnalyzerModule],
  providers: [MentionsService, MentionsStreamService],
  exports: [MentionsService],
})
export class TweetModule {}
