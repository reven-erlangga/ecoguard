import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TwitterModule } from './common/twitter/twitter.module';
import { CompromiseModule } from './common/compromise/compromise.module';
import { DbscanModule } from './common/dbscan/dbscan.module';
import { TestModule } from './test/test.module';
import { OpenstreetmapModule } from './common/openstreetmap/openstreetmap.module';
import { LocationParserModule } from './common/location-parser/location-parser.module';
import { TweetModule } from './common/tweet/tweet.module';
import { ConfigurationModule } from './configuration/configuration.module';
import { AnalyzerModule } from './analyzer/analyzer.module';
import { ReportModule } from './report/report.module';
import { IssueModule } from './issue/issue.module';
import { FirebaseModule } from './firebase/firebase.module';
import { GeminiModule } from './gemini/gemini.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [TwitterModule, CompromiseModule, DbscanModule, TestModule, OpenstreetmapModule, LocationParserModule, TweetModule, ConfigurationModule, AnalyzerModule, ReportModule, IssueModule, FirebaseModule, GeminiModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
