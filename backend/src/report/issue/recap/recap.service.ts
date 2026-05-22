import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../../../firebase/firebase.service';

@Injectable()
export class RecapService {
  constructor(private readonly firebase: FirebaseService) { }

  async findAll() {
    const firestore = this.firebase.getFirestore();
    const snapshot = await firestore.collection('issues').get();
    const issues = snapshot.docs.map(doc => doc.data());
    const todayStr = new Date().toISOString().split('T')[0];

    const total_pending = issues.filter(issue => issue.status === 'PENDING').length;

    const resolved_today = issues.filter(issue =>
      issue.status === 'RESOLVED' &&
      ((issue.updated_at && issue.updated_at.startsWith(todayStr)) ||
        (issue.created_at && issue.created_at.startsWith(todayStr)))
    ).length;

    const unresolved_today = issues.filter(issue =>
      (issue.status === 'PENDING' || issue.status === 'IN_PROGRESS' || issue.status === 'UNRESOLVED' || issue.status === 'NEED_INFO') &&
      issue.created_at && issue.created_at.startsWith(todayStr)
    ).length;

    return {
      total_pending,
      resolved_today,
      unresolved_today,
    };
  }
}
