import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtUtil } from '../jwt.util';

@Injectable()
export class RefreshTokenService {
  async refreshToken(token: string) {
    try {
      const decoded = JwtUtil.verify(token);
      const newToken = JwtUtil.sign({
        uid: decoded.uid,
        email: decoded.email,
        name: decoded.name,
      });

      return {
        token: newToken,
        user: {
          id: decoded.uid,
          email: decoded.email,
          name: decoded.name,
        }
      };
    } catch (err: any) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }
}
