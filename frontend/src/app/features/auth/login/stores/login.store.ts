import { Injectable, signal, computed } from '@angular/core';
import { AuthResponse } from '../models/login.model';

@Injectable({
  providedIn: 'root'
})
export class LoginStore {
  private readonly _isLoading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);
  private readonly _user = signal<AuthResponse['user'] | null>(null);
  private readonly _token = signal<string | null>(null);

  readonly isLoading = computed(() => this._isLoading());
  readonly error = computed(() => this._error());
  readonly user = computed(() => this._user());
  readonly token = computed(() => this._token());
  readonly isAuthenticated = computed(() => !!this._user() && !!this._token());

  constructor() {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('ecoguard_user');
      const savedToken = localStorage.getItem('ecoguard_token');
      if (savedUser) {
        try {
          this._user.set(JSON.parse(savedUser));
        } catch {
          localStorage.removeItem('ecoguard_user');
        }
      }
      if (savedToken) {
        this._token.set(savedToken);
      }
    }
  }

  setLoading(isLoading: boolean) {
    this._isLoading.set(isLoading);
  }

  setError(error: string | null) {
    this._error.set(error);
  }

  setUser(user: AuthResponse['user'] | null, token: string | null = null) {
    this._user.set(user);
    if (token) {
      this._token.set(token);
    }
    if (typeof window !== 'undefined') {
      if (user) {
        localStorage.setItem('ecoguard_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('ecoguard_user');
      }
      if (token) {
        localStorage.setItem('ecoguard_token', token);
      } else if (!user) {
        localStorage.removeItem('ecoguard_token');
      }
    }
  }

  clearAuth() {
    this._user.set(null);
    this._token.set(null);
    this._error.set(null);
    this._isLoading.set(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ecoguard_user');
      localStorage.removeItem('ecoguard_token');
    }
  }
}
