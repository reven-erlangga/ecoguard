import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RegisterMainComponent } from '../../features/auth/register/main.component';

@Component({
  selector: 'app-register',
  imports: [RegisterMainComponent],
  template: `<app-register-main></app-register-main>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {}
