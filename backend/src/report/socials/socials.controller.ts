import { Controller, Get, Query } from '@nestjs/common';
import { SocialsService } from './socials.service';
import { GetSocialsQueryDto } from './dto/get-socials-query.dto';

@Controller('report/socials')
export class SocialsController {
  constructor(private readonly socialsService: SocialsService) {}

  @Get()
  async getSocialFeed(@Query() query?: GetSocialsQueryDto) {
    return await this.socialsService.getSocialFeed(query);
  }
}
