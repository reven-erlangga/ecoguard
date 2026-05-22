import { Module } from '@nestjs/common';
import { GetUserMentionsModule } from './get-user-mentions/get-user-mentions.module';

@Module({
  imports: [GetUserMentionsModule]
})
export class TwitterModule {}
