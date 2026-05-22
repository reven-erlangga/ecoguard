import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReductionDataPoint } from '../../models/reduction-trend.model';

@Component({
  selector: 'app-reduction-trend-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chart.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartComponent {
  @Input({ required: true }) data: ReductionDataPoint[] = [];

  protected getMax(data: ReductionDataPoint[]): number {
    return Math.max(...data.map(d => d.value), 100);
  }

  protected getHeight(value: number, max: number): string {
    return `${(value / max) * 100}%`;
  }
}
