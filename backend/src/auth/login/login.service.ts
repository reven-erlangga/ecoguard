import { Injectable, UnauthorizedException } from '@nestjs/common';
import { FirebaseService } from '../../firebase/firebase.service';
import { LoginDto } from '../dto/login.dto';
import { JwtUtil } from '../jwt.util';
import * as crypto from 'crypto';

@Injectable()
export class LoginService {
  constructor(private readonly firebase: FirebaseService) {}

  async login(dto: LoginDto) {
    const emailLower = dto.email.toLowerCase();
    const firestore = this.firebase.getFirestore();

    const userDoc = await firestore.collection('users').doc(emailLower).get();
    if (!userDoc.exists) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const userData = userDoc.data();
    if (!userData) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const calculatedHash = crypto.pbkdf2Sync(dto.password, userData.salt, 1000, 64, 'sha512').toString('hex');
    if (calculatedHash !== userData.password) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokenPayload = {
      uid: userData.uid || userDoc.id,
      email: userData.email,
      name: userData.name,
    };

    const token = JwtUtil.sign(tokenPayload);

    return {
      token,
      user: {
        id: userData.uid || userDoc.id,
        email: userData.email,
        name: userData.name,
      }
    };
  }
}
