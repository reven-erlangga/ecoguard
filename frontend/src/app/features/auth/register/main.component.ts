import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AuthTemplateComponent } from '../../../shared/templates/auth-template/auth-template.component';
import { RegisterAlertComponent } from './components/alert/alert.component';
import { RegisterEntryComponent } from './components/entry/entry.component';
import { RegisterFacade } from './facades/register.facade';
import { RegisterState } from './states/register.state';

@Component({
  selector: 'app-register-main',
  imports: [AuthTemplateComponent, RegisterAlertComponent, RegisterEntryComponent],
  templateUrl: './main.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [RegisterState, RegisterFacade],  // scoped to this subtree
})
export class RegisterMainComponent {
  readonly facade = inject(RegisterFacade);
}
