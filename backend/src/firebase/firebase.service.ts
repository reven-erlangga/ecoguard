import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService implements OnModuleInit {
  onModuleInit() {
    // If already initialized (e.g. NestJS hot-reload), skip
    if (admin.apps.length > 0) {
      console.log('[FirebaseService] Firebase Admin SDK already initialized, reusing existing app.');
      return;
    }

    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY;

    // Fail fast at startup if credentials are missing
    const missing: string[] = [];
    if (!projectId) missing.push('FIREBASE_PROJECT_ID');
    if (!clientEmail) missing.push('FIREBASE_CLIENT_EMAIL');
    if (!rawPrivateKey) missing.push('FIREBASE_PRIVATE_KEY');

    if (missing.length > 0) {
      throw new Error(
        `[FirebaseService] Missing required environment variables: ${missing.join(', ')}. ` +
        'Application cannot start without valid Firebase credentials.',
      );
    }

    // Replace literal \n sequences (as stored in .env files) with real newline characters
    const privateKey = rawPrivateKey!.replace(/\\n/g, '\n');

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });

    console.log('[FirebaseService] Firebase Admin SDK initialized successfully.');
  }

  getAuth() {
    return admin.auth();
  }

  getFirestore() {
    return admin.firestore();
  }
}
