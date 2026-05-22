import { Injectable, OnModuleInit } from '@nestjs/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { FirebaseService } from '../../firebase/firebase.service';

@Injectable()
export class TwitterConfigService implements OnModuleInit {
  // Default to false to prevent automatic connection on startup unless explicitly enabled
  private streamEnabledSubject = new BehaviorSubject<boolean>(false);
  private docRef: FirebaseFirestore.DocumentReference;

  constructor(private readonly firebase: FirebaseService) {}

  onModuleInit() {
    try {
      const firestore = this.firebase.getFirestore();
      this.docRef = firestore.collection('configurations').doc('twitter');

      // Listen to real-time updates from Firestore, with error callback to prevent crashes
      this.docRef.onSnapshot(
        (snapshot) => {
          try {
            if (snapshot.exists) {
              const data = snapshot.data();
              if (data && typeof data.streamEnabled === 'boolean') {
                if (this.streamEnabledSubject.value !== data.streamEnabled) {
                  this.streamEnabledSubject.next(data.streamEnabled);
                  console.log(`Twitter Stream Config synced from Firebase: ${data.streamEnabled ? 'Enabled' : 'Disabled'}`);
                }
              }
            } else {
              // Document doesn't exist, create it with default value
              this.docRef.set({ streamEnabled: false }).catch(err => {
                console.warn('Failed to set default twitter stream config:', err.message);
              });
            }
          } catch (e: any) {
            console.error('Error inside TwitterConfigService onSnapshot handler:', e.message);
          }
        },
        (error) => {
          console.warn('TwitterConfigService: Firestore onSnapshot failed (possibly quota exceeded):', error.message);
        }
      );
    } catch (err: any) {
      console.warn('Failed to initialize TwitterConfigService:', err.message);
    }
  }

  /**
   * Observable to listen for stream status changes
   */
  get streamStatus$(): Observable<boolean> {
    return this.streamEnabledSubject.asObservable();
  }

  /**
   * Get current stream status locally
   */
  isStreamEnabled(): boolean {
    return this.streamEnabledSubject.value;
  }

  /**
   * Enable the mentions stream in Firebase
   */
  async enableStream() {
    if (!this.streamEnabledSubject.value) {
      this.streamEnabledSubject.next(true); // Optimistic update
      await this.docRef.set({ streamEnabled: true }, { merge: true });
      console.log('Twitter Stream Config (Firebase): Set to Enabled');
    }
  }

  /**
   * Disable the mentions stream in Firebase
   */
  async disableStream() {
    if (this.streamEnabledSubject.value) {
      this.streamEnabledSubject.next(false); // Optimistic update
      await this.docRef.set({ streamEnabled: false }, { merge: true });
      console.log('Twitter Stream Config (Firebase): Set to Disabled');
    }
  }
}
