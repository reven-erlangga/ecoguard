import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReductionTrendLoadFacade } from './facades/load.facade';
import { HeaderComponent } from './components/header/header.component';
import { ChartComponent } from './components/chart/chart.component';
import { LoadingComponent } from './components/loading/loading.component';

@Component({
  selector: 'app-reduction-trend',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    ChartComponent,
    LoadingComponent
  ],
  host: { class: 'block' },
  templateUrl: './main.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReductionTrendComponent {
  protected facade = inject(ReductionTrendLoadFacade);
}
