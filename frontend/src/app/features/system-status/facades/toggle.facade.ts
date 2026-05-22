import { inject, Injectable } from '@angular/core';
import { ApiService } from '../../../shared/services/api.service';
import { finalize } from 'rxjs/operators';
import { SystemStatusLoadFacade } from './load.facade';

@Injectable({
  providedIn: 'root'
})
export class SystemStatusToggleFacade {
  private api = inject(ApiService);
  private loadFacade = inject(SystemStatusLoadFacade);

  status = this.loadFacade.status;
  loading = this.loadFacade.loading;

  toggleStatus() {
    this.loadFacade.loading.set(true);
    const nextEnabled = this.loadFacade.status() !== 'ACTIVE';
    
    this.api.post<{ success: boolean, enabled: boolean, status: 'ACTIVE' | 'DEACTIVE' }>('twitter/status', { enabled: nextEnabled }).pipe(
      finalize(() => this.loadFacade.loading.set(false))
    ).subscribe({
      next: (res) => {
        this.loadFacade.status.set(res.status);
      },
      error: (err) => console.error('Failed to toggle status', err)
    });
  }
}
