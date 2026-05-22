import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-auditing-header',
  standalone: true,
  templateUrl: './header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {}
