import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html'
})
export class AppSidebarComponent {
  isOpen = input<boolean>(false);
  closeSidebar = output<void>();

  close() {
    this.closeSidebar.emit();
  }
}
