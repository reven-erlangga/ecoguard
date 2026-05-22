import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { RefreshTokenFacade } from '../../features/auth/refresh-token/facades/refresh-token.facade';
import { LoginStore } from '../../features/auth/login/stores/login.store';

/** URL segments that must NOT trigger a refresh (would cause infinite loop). */
const BYPASS_URLS = ['auth/refresh-token', 'auth/login', 'auth/logout'];

const shouldBypass = (req: HttpRequest<unknown>): boolean =>
  BYPASS_URLS.some((segment) => req.url.includes(segment));

/**
 * refresh-token.interceptor
 *
 * Intercepts HTTP 401 responses and attempts a silent token refresh via
 * `RefreshTokenFacade`. If the refresh succeeds the original request is
 * retried once with the new token. If it fails the user is signed out.
 *
 * ─ Bypass: refresh/login/logout endpoints are excluded to prevent loops.
 * ─ Dedup:  concurrent 401s share one refresh call (handled inside the facade).
 */
export const refreshTokenInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const refreshFacade = inject(RefreshTokenFacade);
  const loginStore = inject(LoginStore);

  return next(req).pipe(
    catchError((error: unknown) => {
      // Only intercept 401 from non-bypass endpoints when a token exists
      if (
        error instanceof HttpErrorResponse &&
        error.status === 401 &&
        !shouldBypass(req) &&
        loginStore.token()
      ) {
        return refreshFacade.refresh().pipe(
          switchMap(() => {
            // Retry the original request with the new token now stored in LoginStore
            const newToken = loginStore.token();
            const retried = newToken
              ? req.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } })
              : req;
            return next(retried);
          }),
          catchError((refreshError: unknown) => {
            // Refresh already cleared auth state in the facade – just propagate
            return throwError(() => refreshError);
          })
        );
      }

      return throwError(() => error);
    })
  );
};
