import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertComponent as BaseAlert } from '../../../../../shared/atoms/alert/alert.component';

@Component({
  selector: 'app-login-alert',
  standalone: true,
  imports: [CommonModule, BaseAlert],
  templateUrl: './alert.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertComponent {
  @Input() message: string = '';
}
