import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { Router } from '@angular/router';
import { LoginStore } from '../../features/auth/login/stores/login.store';

export const authGuard = () => {
  const platformId = inject(PLATFORM_ID);
  const loginStore = inject(LoginStore);
  const router = inject(Router);

  // Skip guard check on the server since localStorage (auth token) is client-only.
  // This prevents incorrect redirection to the login page on page refresh/initial load.
  if (isPlatformServer(platformId)) {
    return true;
  }

  if (loginStore.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/login']);
};
