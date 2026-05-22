import { ChangeDetectionStrategy, Component, inject, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { LogoutMainComponent } from '../../../features/auth/logout/main.component';
import { faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AppSidebarComponent } from '../../layouts/sidebar/sidebar.component';
import { NavbarComponent } from '../../layouts/navbar/navbar.component';
import { LogoutFacade } from '../../../features/auth/logout/facades/logout.facade';
import { LoginFacade } from '../../../features/auth/login/facades/login.facade';

@Component({
  selector: 'app-admin-template',
  imports: [AppSidebarComponent, NavbarComponent, RouterLink, RouterLinkActive, RouterOutlet, FontAwesomeModule, LogoutMainComponent],
  templateUrl: './admin-template.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(window:resize)': 'onResize()'
  }
})
export class AdminTemplateComponent {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  isSidebarOpen = signal(this.isBrowser ? window.innerWidth >= 1280 : false);
  loginFacade = inject(LoginFacade);
  logoutFacade = inject(LogoutFacade);
  readonly faLogout = faRightFromBracket;

  onResize() {
    if (!this.isBrowser) return;

    if (window.innerWidth < 1280 && this.isSidebarOpen()) {
      this.isSidebarOpen.set(false);
      return;
    }

    if (window.innerWidth >= 1280 && !this.isSidebarOpen()) {
      this.isSidebarOpen.set(true);
    }
  }

  toggleSidebar() {
    this.isSidebarOpen.update(v => !v);
  }
}
