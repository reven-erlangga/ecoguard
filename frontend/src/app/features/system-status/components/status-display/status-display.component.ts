import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SystemStatusLoadFacade } from '../../facades/load.facade';

@Component({
  selector: 'app-status-display',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './status-display.component.html'
})
export class StatusDisplayComponent {
  protected facade = inject(SystemStatusLoadFacade);
}
