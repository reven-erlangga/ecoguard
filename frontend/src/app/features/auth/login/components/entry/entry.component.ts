import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputComponent } from '../../../../../shared/atoms/input/input.component';
import { ButtonComponent } from '../../../../../shared/atoms/button/button.component';
import { LoginFacade } from '../../facades/login.facade';

@Component({
  selector: 'app-entry',
  standalone: true,
  imports: [CommonModule, InputComponent, ButtonComponent],
  templateUrl: './entry.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntryComponent {
  readonly facade = inject(LoginFacade);
}
