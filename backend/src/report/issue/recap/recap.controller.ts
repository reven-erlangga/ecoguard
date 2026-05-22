import { Controller, Get } from '@nestjs/common';
import { RecapService } from './recap.service';

@Controller('report/issue/recap')
export class RecapController {
  constructor(private readonly recapService: RecapService) {}

  @Get()
  async findAll() {
    return await this.recapService.findAll();
  }
}
