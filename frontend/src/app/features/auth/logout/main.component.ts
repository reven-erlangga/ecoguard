import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faRightFromBracket } from '@fortawesome/free-solid-svg-icons';

import { ButtonComponent } from '../../../shared/atoms/button/button.component';
import { LogoutFacade } from './facades/logout.facade';

@Component({
  selector: 'app-logout-main',
  standalone: true,
  imports: [ButtonComponent, FontAwesomeModule],

  templateUrl: './main.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogoutMainComponent {
  readonly facade = inject(LogoutFacade);
  readonly faLogout = faRightFromBracket;



}
