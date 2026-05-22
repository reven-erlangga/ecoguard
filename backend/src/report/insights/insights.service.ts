import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../../firebase/firebase.service';

@Injectable()
export class InsightsService {
  constructor(private readonly firebase: FirebaseService) { }

  async findAll() {
    const firestore = this.firebase.getFirestore();
    const snapshot = await firestore.collection('issues').get();
    const issues = snapshot.docs.map(doc => doc.data());

    // 1. totalIssueProgress: issues with status 'PENDING' or 'IN_PROGRESS'
    const totalIssueProgress = issues.filter(
      issue => issue.status === 'PENDING' || issue.status === 'IN_PROGRESS'
    ).length;

    // 2. totalIssueToday: issues reported today (based on created_at timestamp string prefix)
    const todayStr = new Date().toISOString().split('T')[0]; // e.g. "2026-05-17"
    const totalIssueToday = issues.filter(
      issue => issue.created_at && issue.created_at.startsWith(todayStr)
    ).length;

    // 3. totalCategory: distinct category_ids
    const categories = new Set(issues.map(issue => issue.category_id).filter(Boolean));
    const totalCategory = categories.size;

    // 4. summary: resolved vs unresolved
    const resolved = issues.filter(issue => issue.status === 'RESOLVED').length;
    const unresolved = issues.filter(issue => issue.status === 'UNRESOLVED').length;

    return {
      totalIssueProgress,
      totalIssueToday,
      totalCategory,
      summary: {
        resolved,
        unresolved,
      }
    };
  }
}
