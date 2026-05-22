import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { LoginService } from '../../features/auth/login/services/login.service';
import { LoginStore } from '../../features/auth/login/stores/login.store';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export const authFlowGuard: CanActivateFn = (route, state) => {
  const loginService = inject(LoginService);
  const loginStore = inject(LoginStore);
  const router = inject(Router);
  const currentPath = route.routeConfig?.path;

  // If already authenticated, redirect to dashboard
  if (loginStore.isAuthenticated()) {
    return router.createUrlTree(['/']);
  }

  return loginService.check().pipe(
    map(res => {
      if (!res.registered) {
        // No accounts exist in the system: only register page is allowed
        if (currentPath !== 'register') {
          return router.createUrlTree(['/register']);
        }
      } else {
        // System already has a registered user: only login page is allowed
        if (currentPath === 'register') {
          return router.createUrlTree(['/login']);
        }
      }
      return true;
    }),
    catchError(() => {
      // In case of error (e.g. backend down during initial load), allow access to login
      if (currentPath !== 'login') {
        return of(router.createUrlTree(['/login']));
      }
      return of(true);
    })
  );
};
