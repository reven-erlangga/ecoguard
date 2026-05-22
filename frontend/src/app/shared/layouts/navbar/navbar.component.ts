import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppHeaderComponent } from '../header/header.component';
import { LogoutButtonComponent } from '../../../features/auth/login/components/logout-button/logout-button.component';

@Component({
  selector: 'app-navbar',
  imports: [
    CommonModule,
    AppHeaderComponent,
  ],
  template: `
    <app-header [isMobileOpen]="isMobileOpen()" (toggleSidebar)="toggleSidebar.emit()">
      <!-- We project the logout button into the header's application menu slot -->
    </app-header>
  `
})
export class NavbarComponent {
  isMobileOpen = input<boolean>(false);
  toggleSidebar = output<void>();
}
