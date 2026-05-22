import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../../firebase/firebase.service';

@Injectable()
export class MonitoringService {
  constructor(private readonly firebase: FirebaseService) {}

  async getStatus() {
    const firestore = this.firebase.getFirestore();
    const snapshot = await firestore.collection('issues').get();
    const issues = snapshot.docs.map(doc => doc.data());

    // 1. Total Ingested Reports (TOTAL REPORTS)
    const totalReports = issues.length;

    // 2. Active Nodes (Distinct spatial clusters grouped to ~1.1km precision)
    const activeNodesSet = new Set<string>();
    issues.forEach(issue => {
      if (issue.location && Array.isArray(issue.location)) {
        issue.location.forEach((loc: any) => {
          if (typeof loc.lat === 'number' && typeof loc.lon === 'number') {
            // Round to 2 decimal places to cluster nearby points (~1.1km)
            const key = `${loc.lat.toFixed(2)},${loc.lon.toFixed(2)}`;
            activeNodesSet.add(key);
          }
        });
      }
    });
    const activeNodes = activeNodesSet.size;

    // 3. Investigating / Active response (INVESTIGATING)
    const investigating = issues.filter(
      issue => issue.status === 'IN_PROGRESS' || issue.status === 'PENDING'
    ).length;

    // 4. Neutralized / Threats cleared / Resolved (NEUTRALIZED)
    const neutralized = issues.filter(issue => issue.status === 'RESOLVED').length;

    return {
      totalReports,
      activeNodes,
      investigating,
      neutralized,
    };
  }

  async getAnalytics() {
    const firestore = this.firebase.getFirestore();
    const snapshot = await firestore.collection('issues').get();
    const issues = snapshot.docs.map(doc => doc.data());

    const categoriesSnapshot = await firestore.collection('issue_categories').get();
    const categoriesMap: Record<string, string> = {};
    const categoryCounts: Record<string, number> = {};
    
    categoriesSnapshot.docs.forEach(doc => {
      const name = doc.data().name || doc.id;
      categoriesMap[doc.id] = name;
      categoryCounts[name] = 0; // Initialize all existing categories to 0
    });

    // Initialize severity counts
    let highRiskCount = 0;
    let mediumRiskCount = 0;
    let lowRiskCount = 0;

    issues.forEach(issue => {
      const text = `${issue.title || ''} ${issue.content || issue.description || ''}`.toLowerCase();

      const catId = issue.issue_category_id || issue.category_id || 'UNKNOWN';
      const catName = categoriesMap[catId] || catId;
      categoryCounts[catName] = (categoryCounts[catName] || 0) + 1;
      // Classified Severity Risk
      if (
        text.includes('banjir') || 
        text.includes('mati') || 
        text.includes('bahaya') || 
        text.includes('darurat') || 
        text.includes('kecelakaan') || 
        text.includes('kebakaran') || 
        text.includes('clogged') || 
        text.includes('overflow')
      ) {
        highRiskCount++;
      } else if (
        text.includes('rusak') || 
        text.includes('bolong') || 
        text.includes('sampah') || 
        text.includes('menyengat') || 
        text.includes('kotor') || 
        text.includes('macet') || 
        text.includes('smelly')
      ) {
        mediumRiskCount++;
      } else {
        lowRiskCount++;
      }
    });

    // Handle fallbacks if database is empty so charts don't look completely empty at initial startup
    if (issues.length === 0 && Object.keys(categoryCounts).length === 0) {
      categoryCounts['Road Infrastructure'] = 12;
      categoryCounts['Public Facilities'] = 8;
      categoryCounts['Environment & Sanitation'] = 5;
    }

    if (issues.length === 0) {
      highRiskCount = 5;
      mediumRiskCount = 12;
      lowRiskCount = 8;
    }

    const distributionArray = Object.entries(categoryCounts)
      .map(([category, count]) => ({ category, count }))
      .filter(item => item.count > 0);

    return {
      issueDistribution: distributionArray,
      severityAnalytics: {
        highRisk: highRiskCount,
        mediumRisk: mediumRiskCount,
        lowRisk: lowRiskCount,
      },
    };
  }
}
