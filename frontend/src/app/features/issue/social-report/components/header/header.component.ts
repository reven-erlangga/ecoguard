import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-social-report-header',
  standalone: true,
  templateUrl: './header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {}
