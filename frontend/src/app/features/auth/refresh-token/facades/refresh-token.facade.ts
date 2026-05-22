import { Injectable, computed, inject } from '@angular/core';
import { Observable, Subject, throwError } from 'rxjs';
import { tap, catchError, switchMap, share, finalize } from 'rxjs/operators';

import { RefreshTokenService } from '../services/refresh-token.service';
import { RefreshTokenStore } from '../stores/refresh-token.store';
import { RefreshTokenResponse } from '../models/refresh-token.model';
import { LoginStore } from '../../login/stores/login.store';

@Injectable({
  providedIn: 'root'
})
export class RefreshTokenFacade {
  private readonly refreshService = inject(RefreshTokenService);
  private readonly refreshStore = inject(RefreshTokenStore);
  private readonly loginStore = inject(LoginStore);

  // ─── Public selectors ─────────────────────────────────────────────────────
  readonly isRefreshing = computed(() => this.refreshStore.isRefreshing());
  readonly error = computed(() => this.refreshStore.error());
  readonly lastRefreshedAt = computed(() => this.refreshStore.lastRefreshedAt());

  /**
   * Shared in-flight Observable so multiple 401 requests trigger only ONE
   * refresh call. Any subscriber after the first will wait for the same result.
   */
  private refreshInFlight$: Observable<RefreshTokenResponse> | null = null;

  /**
   * Attempt a token refresh.
   *
   * - Returns an Observable<RefreshTokenResponse> that callers (e.g. interceptor) can chain.
   * - Only one HTTP call is made at a time; concurrent callers share the same Observable.
   * - On success  → updates LoginStore with the new token.
   * - On failure  → clears auth state and forces re-login.
   */
  refresh(): Observable<RefreshTokenResponse> {
    // Return the in-flight observable if a refresh is already running
    if (this.refreshInFlight$) {
      return this.refreshInFlight$;
    }

    const currentToken = this.loginStore.token();
    if (!currentToken) {
      this.loginStore.clearAuth();
      return throwError(() => new Error('No token available – cannot refresh'));
    }

    this.refreshStore.setRefreshing(true);
    this.refreshStore.setError(null);

    this.refreshInFlight$ = this.refreshService.refresh(currentToken).pipe(
      tap((response) => {
        // Persist new token + user into the existing LoginStore
        this.loginStore.setUser(response.user, response.token);
        this.refreshStore.markSuccess(response);
      }),
      catchError((err: unknown) => {
        const message = (err as { error?: { message?: string }; message?: string })
          ?.error?.message ?? (err as { message?: string })?.message ?? 'Token refresh failed';
        this.refreshStore.setError(message);
        // Clear session – user must re-login
        this.loginStore.clearAuth();
        return throwError(() => err);
      }),
      finalize(() => {
        // Reset the shared observable so future refreshes start fresh
        this.refreshInFlight$ = null;
        this.refreshStore.setRefreshing(false);
      }),
      // Multicast so every waiting subscriber gets the same emission
      share()
    );

    return this.refreshInFlight$;
  }
}
