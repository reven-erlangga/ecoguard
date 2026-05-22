import { Component, inject } from '@angular/core';
import { LoginFacade } from '../../facades/login.facade';

@Component({
  selector: 'app-logout-button',
  template: `
    @if (facade.isAuthenticated()) {
      <button 
        type="button"
        (click)="logout()"
        class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-200"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        Logout
      </button>
    }
  `
})
export class LogoutButtonComponent {
  protected facade = inject(LoginFacade);

  logout() {
    this.facade.logout();
  }
}
