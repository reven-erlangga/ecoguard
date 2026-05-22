import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuditingStats } from '../../models/summary.model';
import { CardComponent } from '../../../../../shared/molecules/card/card.component';

@Component({
  selector: 'app-auditing-stats',
  standalone: true,
  imports: [CommonModule, CardComponent],
  templateUrl: './stats.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatsComponent {
  @Input({ required: true }) stats: AuditingStats | null = null;
  @Input() loading: boolean = false;
}
