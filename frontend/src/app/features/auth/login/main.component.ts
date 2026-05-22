import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { AuthTemplateComponent } from '../../../shared/templates/auth-template/auth-template.component';
import { EntryComponent } from './components/entry/entry.component';
import { AlertComponent } from './components/alert/alert.component';
import { LoginFacade } from './facades/login.facade';

@Component({
  selector: 'app-login-main',
  standalone: true,
  imports: [
    AuthTemplateComponent,
    EntryComponent,
    AlertComponent
  ],
  templateUrl: './main.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [LoginFacade]
})
export class MainComponent {
  readonly facade = inject(LoginFacade);
}
