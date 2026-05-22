import { Injectable, signal, computed } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LogoutStore {
  private readonly _isLoading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  readonly isLoading = computed(() => this._isLoading());
  readonly error = computed(() => this._error());

  setLoading(isLoading: boolean) {
    this._isLoading.set(isLoading);
  }

  setError(error: string | null) {
    this._error.set(error);
  }

  clear() {
    this._isLoading.set(false);
    this._error.set(null);
  }
}
