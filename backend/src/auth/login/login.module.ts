import { Module } from '@nestjs/common';
import { FirebaseModule } from '../../firebase/firebase.module';
import { LoginController } from './login.controller';
import { LoginService } from './login.service';

@Module({
  imports: [FirebaseModule],
  controllers: [LoginController],
  providers: [LoginService],
  exports: [LoginService],
})
export class LoginModule {}
