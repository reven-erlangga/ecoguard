import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-reduction-trend-header',
  standalone: true,
  templateUrl: './header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {}
