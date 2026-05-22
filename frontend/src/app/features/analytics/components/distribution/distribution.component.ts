import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DistributionData } from '../../models/analytics.model';
import { CardComponent } from '../../../../shared/molecules/card/card.component';

@Component({
  selector: 'app-auditing-distribution',
  standalone: true,
  imports: [CommonModule, CardComponent],
  templateUrl: './distribution.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DistributionComponent {
  @Input({ required: true }) data: DistributionData[] = [];
  @Input() loading: boolean = false;
}
