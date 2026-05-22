import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { LogoutService } from '../services/logout.service';
import { LogoutStore } from '../stores/logout.store';

@Injectable({
  providedIn: 'root'
})
export class LogoutFacade {
  private readonly logoutService = inject(LogoutService);
  private readonly logoutStore = inject(LogoutStore);
  private readonly router = inject(Router);

  readonly isLoading = computed(() => this.logoutStore.isLoading());
  readonly error = computed(() => this.logoutStore.error());

  logout() {
    this.logoutStore.setLoading(true);
    this.logoutStore.setError(null);
    this.logoutService.logout().subscribe({
      next: () => {
        this.logoutStore.clear();
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.logoutStore.setError(err.message ?? 'Logout failed');
        this.logoutStore.setLoading(false);
      }
    });
  }
}
