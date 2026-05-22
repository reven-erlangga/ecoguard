import { Module } from '@nestjs/common';
import { FirebaseModule } from '../../firebase/firebase.module';
import { RegisterController } from './register.controller';
import { RegisterService } from './register.service';
import { CheckModule } from '../check/check.module';

@Module({
  imports: [FirebaseModule, CheckModule],
  controllers: [RegisterController],
  providers: [RegisterService],
  exports: [RegisterService],
})
export class RegisterModule {}
