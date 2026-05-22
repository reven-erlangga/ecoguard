import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../services/login.service';
import { LoginStore } from '../stores/login.store';
import { LoginCredentials } from '../models/login.model';

@Injectable({
  providedIn: 'root'
})
export class LoginFacade {
  private readonly loginService = inject(LoginService);
  private readonly loginStore = inject(LoginStore);
  private readonly router = inject(Router);

  // Form fields as signals
  readonly email = signal<string>('');
  readonly password = signal<string>('');

  // Expose store signals
  readonly isLoading = computed(() => this.loginStore.isLoading());
  readonly error = computed(() => this.loginStore.error());
  readonly isAuthenticated = computed(() => this.loginStore.isAuthenticated());
  readonly user = computed(() => this.loginStore.user());

  // Simple validation – email non‑empty & password >= 8 chars
  readonly isFormValid = computed(() => {
    const emailValid = this.email().trim().length > 0;
    const pwd = this.password();
    return emailValid && pwd.length >= 8;
  });

  // Called from the entry component template
  onSubmit(event: Event) {
    event.preventDefault();
    if (!this.isFormValid()) return;
    const credentials: LoginCredentials = {
      email: this.email(),
      password: this.password()
    };
    this.login(credentials);
  }

  // Core login logic (unchanged besides using store signals)
  login(credentials: LoginCredentials) {
    this.loginStore.setLoading(true);
    this.loginStore.setError(null);

    this.loginService.login(credentials).subscribe({
      next: (response) => {
        this.loginStore.setUser(response.user, response.token);
        this.loginStore.setLoading(false);
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loginStore.setError(err.error?.message || err.message || 'Login failed');
        this.loginStore.setLoading(false);
      }
    });
  }

  check() {
    return this.loginService.check();
  }

  refreshToken() {
    const currentToken = this.loginStore.token();
    if (!currentToken) return;

    this.loginService.refreshToken(currentToken).subscribe({
      next: (response) => {
        this.loginStore.setUser(response.user, response.token);
      },
      error: (err) => {
        console.error('Token refresh failed', err);
        this.logout();
      }
    });
  }

  logout() {
    this.loginStore.setLoading(true);
    this.loginService.logout().subscribe({
      next: () => {
        this.loginStore.clearAuth();
        this.router.navigate(['/login']);
      },
      error: () => {
        this.loginStore.clearAuth();
        this.router.navigate(['/login']);
      }
    });
  }
}
