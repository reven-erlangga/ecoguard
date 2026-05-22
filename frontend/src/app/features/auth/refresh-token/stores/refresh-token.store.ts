import { Injectable, computed, signal } from '@angular/core';
import { RefreshTokenResponse } from '../models/refresh-token.model';

@Injectable({
  providedIn: 'root'
})
export class RefreshTokenStore {
  // ─── Private state ───────────────────────────────────────────────────────────
  private readonly _isRefreshing = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);
  private readonly _lastRefreshedAt = signal<number | null>(null);

  // ─── Public computed selectors ───────────────────────────────────────────────
  readonly isRefreshing = computed(() => this._isRefreshing());
  readonly error = computed(() => this._error());

  /**
   * Timestamp (ms) of the last successful refresh.
   * Useful for guards / interceptors to avoid refreshing too often.
   */
  readonly lastRefreshedAt = computed(() => this._lastRefreshedAt());

  // ─── Mutations ───────────────────────────────────────────────────────────────
  setRefreshing(value: boolean): void {
    this._isRefreshing.set(value);
  }

  setError(error: string | null): void {
    this._error.set(error);
  }

  markSuccess(response: RefreshTokenResponse): void {
    this._lastRefreshedAt.set(Date.now());
    this._isRefreshing.set(false);
    this._error.set(null);
  }

  reset(): void {
    this._isRefreshing.set(false);
    this._error.set(null);
    this._lastRefreshedAt.set(null);
  }
}
