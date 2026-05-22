import { Controller, Post, Body, HttpCode, HttpStatus, BadRequestException } from '@nestjs/common';
import { RefreshTokenService } from './refresh-token.service';

@Controller('auth')
export class RefreshTokenController {
  constructor(private readonly refreshTokenService: RefreshTokenService) {}

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body('token') token: string) {
    if (!token) {
      throw new BadRequestException('Token is required');
    }
    return await this.refreshTokenService.refreshToken(token);
  }
}
