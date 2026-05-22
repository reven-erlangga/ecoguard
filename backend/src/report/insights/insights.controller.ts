import { Controller, Get } from '@nestjs/common';
import { InsightsService } from './insights.service';

@Controller('report/insights')
export class InsightsController {
  constructor(private readonly insightsService: InsightsService) {}

  @Get()
  async findAll() {
    return await this.insightsService.findAll();
  }
}
