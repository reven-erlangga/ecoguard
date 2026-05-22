import { Component, ElementRef, viewChild, input, output, AfterViewInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StatusDisplayComponent } from '../../../features/system-status/components/status-display/status-display.component';
import { SystemStateComponent } from '../../../features/system-status/components/system-state/system-state.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    StatusDisplayComponent,
    SystemStateComponent
  ],
  templateUrl: './header.component.html',
})
export class AppHeaderComponent implements AfterViewInit, OnDestroy {
  isApplicationMenuOpen = false;
  isSearchModalOpen = false;
  isNotificationPanelOpen = signal(false);
  
  isMobileOpen = input<boolean>(false);
  toggleSidebar = output<void>();

  searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');

  handleToggle() {
    this.toggleSidebar.emit();
  }

  toggleApplicationMenu() {
    this.isApplicationMenuOpen = !this.isApplicationMenuOpen;
  }

  openSearchModal() {
    this.isSearchModalOpen = true;
  }

  ngAfterViewInit() {
    if (typeof document !== 'undefined') {
      document.addEventListener('keydown', this.handleKeyDown);
    }
  }

  ngOnDestroy() {
    if (typeof document !== 'undefined') {
      document.removeEventListener('keydown', this.handleKeyDown);
    }
  }

  handleKeyDown = (event: KeyboardEvent) => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
      event.preventDefault();
      this.openSearchModal();
    }
  };
}
