import { Injectable, ConflictException } from '@nestjs/common';
import { FirebaseService } from '../../firebase/firebase.service';
import { RegisterDto } from '../dto/register.dto';
import { CheckService } from '../check/check.service';
import * as crypto from 'crypto';

@Injectable()
export class RegisterService {
  constructor(
    private readonly firebase: FirebaseService,
    private readonly checkService: CheckService,
  ) {}

  async register(dto: RegisterDto) {
    const emailLower = dto.email.toLowerCase();
    
    // Check if any account is already registered
    const existing = await this.checkService.check();
    if (existing.registered) {
      throw new ConflictException('Registration is disabled. An account is already registered.');
    }

    // Create user in Firebase Auth
    const auth = this.firebase.getAuth();
    let uid = '';
    try {
      const userRecord = await auth.createUser({
        email: emailLower,
        password: dto.password,
        displayName: dto.name,
      });
      uid = userRecord.uid;
    } catch (error: any) {
      throw new ConflictException(`Firebase Auth registration failed: ${error.message}`);
    }

    // Hash password and store profile in Firestore
    const firestore = this.firebase.getFirestore();
    const salt = crypto.randomBytes(16).toString('hex');
    const hashedPassword = crypto.pbkdf2Sync(dto.password, salt, 1000, 64, 'sha512').toString('hex');

    try {
      await firestore.collection('users').doc(emailLower).set({
        uid,
        name: dto.name,
        email: emailLower,
        password: hashedPassword,
        salt,
        created_at: new Date().toISOString(),
      });
    } catch (error: any) {
      try {
        await auth.deleteUser(uid);
      } catch (rollbackErr) {
        console.error('Failed to rollback Firebase user registration:', rollbackErr);
      }
      throw new ConflictException(`Failed to save user profile: ${error.message}`);
    }

    return {
      id: uid,
      email: emailLower,
      name: dto.name,
    };
  }
}
