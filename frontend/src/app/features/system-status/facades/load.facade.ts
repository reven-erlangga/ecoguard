import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from '../../../shared/services/api.service';
import { finalize } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SystemStatusLoadFacade {
  private api = inject(ApiService);

  status = signal<'ACTIVE' | 'DEACTIVE'>('DEACTIVE');
  systemName = signal('X_STREAM');
  loading = signal<boolean>(false);

  constructor() {
    this.loadStatus();
  }

  loadStatus() {
    // Smart Loading: Prevent flickering during hydration by checking if we already have a status
    // If status is already set (e.g. from SSR), don't trigger a full loading state that could hide/flicker the UI
    if (!this.status()) {
       this.loading.set(true);
    }

    this.api.get<{ enabled: boolean, status: 'ACTIVE' | 'DEACTIVE' }>('twitter/status').pipe(
      finalize(() => this.loading.set(false))
    ).subscribe({
      next: (res) => {
        this.status.set(res.status);
      },
      error: (err) => {
        console.error('Failed to load status', err);
        // Ensure we keep a valid state even on error to prevent UI from disappearing
        if (!this.status()) {
          this.status.set('DEACTIVE');
        }
      }
    });
  }
}
