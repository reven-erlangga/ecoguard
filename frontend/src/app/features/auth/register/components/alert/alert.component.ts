import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { AlertComponent as BaseAlert } from '../../../../../shared/atoms/alert/alert.component';

@Component({
  selector: 'app-register-alert',
  imports: [BaseAlert],
  template: `<app-alert variant="error" title="Error" [message]="message()" class="block mb-6"></app-alert>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterAlertComponent {
  readonly message = input.required<string>();
}
