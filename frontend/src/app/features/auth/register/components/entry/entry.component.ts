import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { InputComponent } from '../../../../../shared/atoms/input/input.component';
import { ButtonComponent } from '../../../../../shared/atoms/button/button.component';
import { RegisterState } from '../../states/register.state';
import { RegisterFacade } from '../../facades/register.facade';

@Component({
  selector: 'app-register-entry',
  imports: [InputComponent, ButtonComponent],
  templateUrl: './entry.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterEntryComponent {
  /** Form state + validation — no HTTP knowledge */
  readonly form = inject(RegisterState);
  /** Only needed for onSubmit orchestration */
  readonly facade = inject(RegisterFacade);
}

