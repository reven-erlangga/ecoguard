import { Injectable, computed, signal } from '@angular/core';
import { DistributionData } from '../models/analytics.model';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsStore {
  // ─── Private State ────────────────────────────────────────────────────────
  private readonly _distribution = signal<DistributionData[]>([]);
  private readonly _isLoading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  // ─── Public Computed Selectors ────────────────────────────────────────────
  readonly distribution = computed(() => this._distribution());
  readonly isLoading = computed(() => this._isLoading());
  readonly error = computed(() => this._error());

  // ─── Mutations ────────────────────────────────────────────────────────────
  setDistribution(data: DistributionData[]): void {
    this._distribution.set(data);
  }

  setLoading(isLoading: boolean): void {
    this._isLoading.set(isLoading);
  }

  setError(error: string | null): void {
    this._error.set(error);
  }
}
