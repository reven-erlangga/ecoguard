import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuditingSummaryFacade } from './facades/summary.facade';
import { HeaderComponent } from './components/header/header.component';
import { StatsComponent } from './components/stats/stats.component';

@Component({
  selector: 'app-auditing-summary',
  standalone: true,
  imports: [CommonModule, HeaderComponent, StatsComponent],
  templateUrl: './main.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block'
  }
})
export class SummaryMainComponent {
  protected facade = inject(AuditingSummaryFacade);
}
