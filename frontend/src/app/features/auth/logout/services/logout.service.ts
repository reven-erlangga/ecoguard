import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../../shared/services/api.service';

@Injectable({
  providedIn: 'root'
})
export class LogoutService {
  private readonly apiService = inject(ApiService);

  logout(): Observable<void> {
    return this.apiService.post<void>('auth/logout');
  }
}
