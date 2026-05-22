import { Injectable, computed, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RegisterStore {
  // ─── Private state ───────────────────────────────────────────────────────────
  private readonly _isLoading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);
  private readonly _isSuccess = signal<boolean>(false);

  // ─── Public computed selectors ───────────────────────────────────────────────
  readonly isLoading = computed(() => this._isLoading());
  readonly error = computed(() => this._error());
  readonly isSuccess = computed(() => this._isSuccess());

  // ─── Mutations ───────────────────────────────────────────────────────────────
  setLoading(value: boolean): void {
    this._isLoading.set(value);
  }

  setError(error: string | null): void {
    this._error.set(error);
  }

  setSuccess(value: boolean): void {
    this._isSuccess.set(value);
  }

  reset(): void {
    this._isLoading.set(false);
    this._error.set(null);
    this._isSuccess.set(false);
  }
}
