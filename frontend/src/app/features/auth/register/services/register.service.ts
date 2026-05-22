import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../../shared/services/api.service';
import { RegisterCredentials, RegisterResponse } from '../models/register.model';

@Injectable({
  providedIn: 'root'
})
export class RegisterService {
  private readonly apiService = inject(ApiService);

  register(credentials: RegisterCredentials): Observable<RegisterResponse> {
    return this.apiService.post<RegisterResponse>('auth/register', credentials);
  }
}
