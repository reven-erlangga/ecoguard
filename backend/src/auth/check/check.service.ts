import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../../firebase/firebase.service';

@Injectable()
export class CheckService {
  constructor(private readonly firebase: FirebaseService) {}

  async check() {
    try {
      // 1. Check in Firestore collection 'users'
      const firestore = this.firebase.getFirestore();
      const usersSnapshot = await firestore.collection('users').limit(1).get();
      if (!usersSnapshot.empty) {
        return { registered: true };
      }

      // 2. Check in Firebase Authentication (listUsers)
      const auth = this.firebase.getAuth();
      const userList = await auth.listUsers(1);
      if (userList.users.length > 0) {
        return { registered: true };
      }

      return { registered: false };
    } catch (error: any) {
      // Suppress repetitive warning for missing Firebase configuration
      if (error.message.includes('There is no configuration')) {
        console.debug('[CheckService] Firebase configuration missing; skipping registration check.');
      } else {
        console.warn('[CheckService] Failed to check registered status, assuming not registered:', error.message);
      }
      return { registered: false };
    }
  }
}
