import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../../shared/services/api.service';

@Injectable({
  providedIn: 'root'
})
export class IssueDatatableService {
  private readonly apiService = inject(ApiService);

  getCategories(): Observable<any[]> {
    return this.apiService.get<any[]>('report/category');
  }

  getIssues(queryParams: any): Observable<any> {
    return this.apiService.get<any>('issue', queryParams);
  }

  updateIssue(id: string, formData: FormData): Observable<any> {
    return this.apiService.patch<any>(`issue/${id}`, formData);
  }
}
