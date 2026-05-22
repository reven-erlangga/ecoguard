import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from '../../../shared/services/api.service';
import { IRecapResponse, RecapData } from '../models/recap.model';
import { map, finalize } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RecapFacade {
  private api = inject(ApiService);

  data = signal<RecapData | null>(null);
  loading = signal<boolean>(false);

  constructor() {
    this.loadRecap();
  }

  loadRecap() {
    // Only show loading if we don't have data yet to avoid flickering (hydration support)
    if (!this.data()) {
      this.loading.set(true);
    }

    this.api.get<IRecapResponse>('report/issue/recap').pipe(
      map(res => ({
        totalPending: res.total_pending,
        resolvedToday: res.resolved_today,
        unresolvedToday: res.unresolved_today,
        totalCategory: res.total_category
      } as RecapData)),
      finalize(() => this.loading.set(false))
    ).subscribe({
      next: (data) => this.data.set(data),
      error: (err) => {
        console.error('Failed to load recap data', err);
        this.data.set(null);
      }
    });
  }
}
