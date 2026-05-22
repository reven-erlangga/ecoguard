import { Injectable, signal } from '@angular/core';
import { ReductionDataPoint } from '../models/reduction-trend.model';
import { delay, of } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ReductionTrendLoadFacade {
  data = signal<ReductionDataPoint[]>([]);
  loading = signal<boolean>(false);

  constructor() {
    this.loadTrend();
  }

  loadTrend() {
    // Only show loading if we don't have data yet to avoid flickering during hydration
    if (this.data().length === 0) {
      this.loading.set(true);
    }
    
    // Dummy Data simulation
    const dummyData: ReductionDataPoint[] = [
      { month: 'JAN', value: 30 },
      { month: 'FEB', value: 45 },
      { month: 'MAR', value: 35 },
      { month: 'APR', value: 60 },
      { month: 'MAY', value: 55 },
      { month: 'JUN', value: 80 }
    ];

    of(dummyData).pipe(
      delay(1000), // Simulate network delay
      finalize(() => this.loading.set(false))
    ).subscribe({
      next: (data) => this.data.set(data),
      error: (err) => console.error('Failed to load trend data', err)
    });
  }
}
