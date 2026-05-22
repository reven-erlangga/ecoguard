import { Module } from '@nestjs/common';
import { CategoryController } from './category.controller';
import { IssueModule } from '../../issue/issue.module';

@Module({
  imports: [IssueModule],
  controllers: [CategoryController],
})
export class CategoryModule {}
