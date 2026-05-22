import { Injectable, computed, signal } from '@angular/core';
import { PasswordStrength } from '../models/register.model';
import { computePasswordStrength } from '../utils/password-strength.util';

/**
 * RegisterState
 *
 * Responsibility: form field state + derived validation signals.
 * Does NOT know about HTTP, routing, or the store.
 */
@Injectable()
export class RegisterState {
  // ─── Raw field signals ───────────────────────────────────────────────────
  readonly name            = signal<string>('');
  readonly email           = signal<string>('');
  readonly password        = signal<string>('');
  readonly confirmPassword = signal<string>('');

  // ─── Derived / computed ──────────────────────────────────────────────────
  readonly passwordStrength = computed<PasswordStrength>(() =>
    computePasswordStrength(this.password())
  );

  readonly passwordsMatch = computed(() =>
    this.password() === this.confirmPassword()
  );

  readonly isValid = computed(() =>
    this.name().trim().length > 2 &&
    this.email().trim().includes('@') &&
    this.password().length >= 8 &&
    this.passwordStrength().score >= 2 &&
    this.passwordsMatch()
  );

  // ─── Helper ──────────────────────────────────────────────────────────────
  reset(): void {
    this.name.set('');
    this.email.set('');
    this.password.set('');
    this.confirmPassword.set('');
  }
}
