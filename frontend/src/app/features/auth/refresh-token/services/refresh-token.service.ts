import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../../shared/services/api.service';
import { RefreshTokenResponse } from '../models/refresh-token.model';

@Injectable({
  providedIn: 'root'
})
export class RefreshTokenService {
  private readonly apiService = inject(ApiService);

  /**
   * Calls POST /auth/refresh-token with the current token.
   * The backend validates the token and returns a fresh one.
   */
  refresh(token: string): Observable<RefreshTokenResponse> {
    return this.apiService.post<RefreshTokenResponse>('auth/refresh-token', { token });
  }
}
