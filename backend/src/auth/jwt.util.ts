import * as crypto from 'crypto';

export class JwtUtil {
  private static readonly SECRET = process.env.JWT_SECRET || 'ecoguard-super-secret-key-12345';

  private static base64UrlEncode(str: string | Buffer): string {
    const buf = typeof str === 'string' ? Buffer.from(str) : str;
    return buf.toString('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  }

  private static base64UrlDecode(str: string): string {
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    return Buffer.from(base64, 'base64').toString('utf8');
  }

  static sign(payload: any, expiresInSeconds = 3600): string {
    const header = { alg: 'HS256', typ: 'JWT' };
    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + expiresInSeconds;
    
    const fullPayload = { ...payload, iat, exp };
    const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
    const encodedPayload = this.base64UrlEncode(JSON.stringify(fullPayload));
    
    const tokenData = `${encodedHeader}.${encodedPayload}`;
    const signature = crypto.createHmac('sha256', this.SECRET)
      .update(tokenData)
      .digest();
      
    const encodedSignature = this.base64UrlEncode(signature);
    return `${tokenData}.${encodedSignature}`;
  }

  static verify(token: string): any {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }
    
    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    const tokenData = `${encodedHeader}.${encodedPayload}`;
    const calculatedSignature = this.base64UrlEncode(
      crypto.createHmac('sha256', this.SECRET).update(tokenData).digest()
    );
    
    if (calculatedSignature !== encodedSignature) {
      throw new Error('Invalid signature');
    }
    
    const payload = JSON.parse(this.base64UrlDecode(encodedPayload));
    if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) {
      throw new Error('Token expired');
    }
    
    return payload;
  }
}
