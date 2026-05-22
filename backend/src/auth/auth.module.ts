import { Module } from '@nestjs/common';
import { LoginModule } from './login/login.module';
import { RegisterModule } from './register/register.module';
import { RefreshTokenModule } from './refresh-token/refresh-token.module';
import { CheckModule } from './check/check.module';

@Module({
  imports: [LoginModule, RegisterModule, RefreshTokenModule, CheckModule],
})
export class AuthModule {}
