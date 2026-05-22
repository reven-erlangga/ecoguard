import { Injectable, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { RegisterService } from '../services/register.service';
import { RegisterStore } from '../stores/register.store';
import { RegisterState } from '../states/register.state';

/**
 * RegisterFacade
 *
 * Responsibility: orchestrate service calls, store mutations, and navigation.
 * Does NOT hold form fields or validation logic — delegates to RegisterState.
 */
@Injectable()
export class RegisterFacade {
  private readonly registerService = inject(RegisterService);
  private readonly registerStore   = inject(RegisterStore);
  private readonly router          = inject(Router);

  // Expose state so EntryComponent can bind directly to field signals
  readonly form = inject(RegisterState);

  // ─── Store selectors (read-only surface) ─────────────────────────────────
  readonly isLoading = computed(() => this.registerStore.isLoading());
  readonly error     = computed(() => this.registerStore.error());
  readonly isSuccess = computed(() => this.registerStore.isSuccess());

  // ─── Action ──────────────────────────────────────────────────────────────
  onSubmit(event: Event): void {
    event.preventDefault();
    if (!this.form.isValid()) return;

    this.registerStore.setLoading(true);
    this.registerStore.setError(null);

    this.registerService
      .register({
        name:     this.form.name().trim(),
        email:    this.form.email().trim(),
        password: this.form.password(),
      })
      .subscribe({
        next: () => {
          this.registerStore.setSuccess(true);
          this.registerStore.setLoading(false);
          this.router.navigate(['/login']);
        },
        error: (err: { error?: { message?: string }; message?: string }) => {
          this.registerStore.setError(
            err.error?.message ?? err.message ?? 'Registration failed'
          );
          this.registerStore.setLoading(false);
        },
      });
  }
}
