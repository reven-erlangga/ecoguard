import { Controller, Get } from '@nestjs/common';
import { MonitoringService } from './monitoring.service';

@Controller('report/monitoring-status')
export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) {}

  @Get()
  async getStatus() {
    return await this.monitoringService.getStatus();
  }

  @Get('analytics')
  async getAnalytics() {
    return await this.monitoringService.getAnalytics();
  }
}
