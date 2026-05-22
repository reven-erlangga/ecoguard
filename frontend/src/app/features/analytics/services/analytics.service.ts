import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../shared/services/api.service';
import { IAnalyticsAPIResponse } from '../models/analytics.model';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private readonly apiService = inject(ApiService);

  getAnalytics(): Observable<IAnalyticsAPIResponse> {
    return this.apiService.get<IAnalyticsAPIResponse>('report/monitoring-status/analytics');
  }
}
