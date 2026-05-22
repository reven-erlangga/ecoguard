import { Module } from '@nestjs/common';
import { FirebaseModule } from '../../firebase/firebase.module';
import { CheckController } from './check.controller';
import { CheckService } from './check.service';

@Module({
  imports: [FirebaseModule],
  controllers: [CheckController],
  providers: [CheckService],
  exports: [CheckService],
})
export class CheckModule {}
