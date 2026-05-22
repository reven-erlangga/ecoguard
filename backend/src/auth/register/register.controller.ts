import { Controller, Post, Body } from '@nestjs/common';
import { RegisterService } from './register.service';
import { RegisterDto } from '../dto/register.dto';

@Controller('auth')
export class RegisterController {
  constructor(private readonly registerService: RegisterService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return await this.registerService.register(registerDto);
  }
}
