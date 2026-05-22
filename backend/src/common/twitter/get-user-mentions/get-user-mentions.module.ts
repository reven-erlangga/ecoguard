import { Module } from '@nestjs/common';
import { GetUserMentionsService } from './get-user-mentions.service';
import { GetUserMentionsController } from './get-user-mentions.controller';

@Module({
  controllers: [GetUserMentionsController],
  providers: [GetUserMentionsService],
  exports: [GetUserMentionsService],
})
export class GetUserMentionsModule {}
