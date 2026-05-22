import { inject, Injectable, computed } from '@angular/core';
import { IAnalyticsAPIResponse, DistributionData } from '../models/analytics.model';
import { AnalyticsService } from '../services/analytics.service';
import { AnalyticsStore } from '../stores/analytics.store';

@Injectable({
  providedIn: 'root'
})
export class AuditingAnalyticsFacade {
  private readonly analyticsService = inject(AnalyticsService);
  private readonly analyticsStore = inject(AnalyticsStore);

  // ─── Exposed Signals ──────────────────────────────────────────────────────
  readonly distribution = computed(() => this.analyticsStore.distribution());
  readonly loading = computed(() => this.analyticsStore.isLoading());
  readonly error = computed(() => this.analyticsStore.error());

  constructor() {
    this.loadAnalytics();
  }

  // ─── Actions ──────────────────────────────────────────────────────────────
  loadAnalytics(): void {
    this.analyticsStore.setLoading(true);
    this.analyticsStore.setError(null);

    this.analyticsService.getAnalytics().subscribe({
      next: (data) => {
        const mapped = this.mapToAnalytics(data);
        this.analyticsStore.setDistribution(mapped.distribution);
        this.analyticsStore.setLoading(false);
      },
      error: (err) => {
        console.error('Failed to load analytics data', err);
        this.analyticsStore.setError(err.message || 'Failed to load analytics');
        this.analyticsStore.setLoading(false);
      }
    });
  }

  // ─── Data Mapping ─────────────────────────────────────────────────────────
  private mapToAnalytics(res: IAnalyticsAPIResponse) {
    const dist = res.issue_distribution || [];

    // Calculate total count for distribution
    const totalCount = dist.reduce((acc, curr) => acc + curr.count, 0);

    // Issue Distribution mappings
    const colors = ['bg-brand-500', 'bg-purple-500', 'bg-yellow-500', 'bg-blue-500', 'bg-emerald-500', 'bg-red-500', 'bg-orange-500'];
    const raw = dist.map(item => (totalCount > 0 ? (item.count / totalCount) * 100 : 0));
    const floors = raw.map(v => Math.floor(v));
    const fractions = raw.map((v, i) => v - floors[i]);
    const sumFloors = floors.reduce((a, b) => a + b, 0);
    const target = dist.length > 0 && totalCount > 0 ? 100 : sumFloors;
    let remaining = target - sumFloors;

    const adjusted = [...floors];
    if (remaining > 0 && adjusted.length > 0) {
      const indices = adjusted
        .map((_, i) => i)
        .sort((a, b) => fractions[b] - fractions[a]);

      for (let i = 0; i < remaining; i++) {
        adjusted[indices[i % indices.length]] += 1;
      }
    }

    const distribution: DistributionData[] = dist.map((item, index) => ({
      category: item.category.toUpperCase(),
      value: adjusted[index] ?? 0,
      color: colors[index % colors.length],
    }));

    return { distribution };
  }
}
