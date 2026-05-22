import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from '../../../../shared/services/api.service';
import { AuditingStats, IMonitoringStatusResponse } from '../models/summary.model';
import { map } from 'rxjs/operators';
import { finalize } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuditingSummaryFacade {
  private api = inject(ApiService);

  stats = signal<AuditingStats | null>(null);
  loading = signal<boolean>(false);

  constructor() {
    this.loadStats();
  }

  loadStats() {
    this.loading.set(true);

    this.api.get<IMonitoringStatusResponse>('report/monitoring-status').pipe(
      map(res => this.mapToStats(res)),
      finalize(() => this.loading.set(false))
    ).subscribe({
      next: (data) => this.stats.set(data),
      error: (err) => {
        console.error('Failed to load summary stats', err);
      }
    });
  }

  private mapToStats(res: IMonitoringStatusResponse): AuditingStats {
    return {
      totalReports: res.total_reports,
      activeNodes: res.active_nodes,
      investigating: res.investigating,
      neutralized: res.neutralized
    };
  }
}
