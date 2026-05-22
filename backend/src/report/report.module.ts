import { Module } from '@nestjs/common';
import { IssueModule } from './issue/issue.module';
import { InsightsModule } from './insights/insights.module';
import { RecapModule as NewRecapModule } from './issue/recap/recap.module';
import { CategoryModule } from './category/category.module';
import { SocialsModule } from './socials/socials.module';
import { MonitoringModule } from './monitoring/monitoring.module';

@Module({
  imports: [IssueModule, InsightsModule, NewRecapModule, CategoryModule, SocialsModule, MonitoringModule]
})
export class ReportModule {}
