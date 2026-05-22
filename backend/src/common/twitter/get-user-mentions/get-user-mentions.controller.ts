import { Controller, Get, Query } from '@nestjs/common';
import { GetUserMentionsService } from './get-user-mentions.service';

@Controller('twitter/user/mentions')
export class GetUserMentionsController {
  constructor(private readonly getUserMentionsService: GetUserMentionsService) {}

  @Get()
  async getUserMentions(
    @Query('userName') userName?: string,
    @Query('sinceTime') sinceTime?: string,
    @Query('untilTime') untilTime?: string,
    @Query('cursor') cursor?: string,
  ) {
    return this.getUserMentionsService.getUserMentions({
      userName,
      sinceTime: sinceTime ? parseInt(sinceTime, 10) : undefined,
      untilTime: untilTime ? parseInt(untilTime, 10) : undefined,
      cursor,
    });
  }
}
