import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SystemStatusLoadFacade } from './facades/load.facade';
import { StatusDisplayComponent } from './components/status-display/status-display.component';
import { SystemStateComponent } from './components/system-state/system-state.component';

@Component({
  selector: 'app-system-status-main',
  standalone: true,
  imports: [
    CommonModule,
    StatusDisplayComponent,
    SystemStateComponent
  ],
  templateUrl: './main.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SystemStatusMainComponent {
  protected facade = inject(SystemStatusLoadFacade);
}
