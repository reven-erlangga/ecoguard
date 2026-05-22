import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthResponse, LoginCredentials } from '../models/login.model';
import { ApiService } from '../../../../shared/services/api.service';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private readonly apiService = inject(ApiService);

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.apiService.post<AuthResponse>('auth/login', credentials);
  }

  register(name: string, email: string, password: string): Observable<any> {
    return this.apiService.post<any>('auth/register', { name, email, password });
  }

  check(): Observable<{ registered: boolean }> {
    return this.apiService.get<{ registered: boolean }>('auth/check');
  }

  refreshToken(token: string): Observable<AuthResponse> {
    return this.apiService.post<AuthResponse>('auth/refresh-token', { token });
  }

  logout(): Observable<void> {
    return this.apiService.post<void>('auth/logout');
  }
}
