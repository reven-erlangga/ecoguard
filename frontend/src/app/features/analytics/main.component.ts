import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuditingAnalyticsFacade } from './facades/analytics.facade';
import { DistributionComponent } from './components/distribution/distribution.component';

@Component({
  selector: 'app-auditing-analytics',
  standalone: true,
  imports: [CommonModule, DistributionComponent],
  templateUrl: './main.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block'
  }
})
export class AnalyticsMainComponent {
  protected facade = inject(AuditingAnalyticsFacade);
}
