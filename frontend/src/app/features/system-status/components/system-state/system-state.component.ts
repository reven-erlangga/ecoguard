import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SystemStatusToggleFacade } from '../../facades/toggle.facade';
import { ButtonComponent } from '../../../../shared/atoms/button/button.component';

@Component({
  selector: 'app-system-state',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './system-state.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SystemStateComponent {
  protected facade = inject(SystemStatusToggleFacade);

  toggleState() {
    this.facade.toggleStatus();
  }
}
