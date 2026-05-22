import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LoginStore } from '../../features/auth/login/stores/login.store';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const loginStore = inject(LoginStore);
  const token = loginStore.token();

  if (token) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(cloned);
  }

  return next(req);
};
