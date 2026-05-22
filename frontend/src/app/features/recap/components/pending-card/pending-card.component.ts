import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChartLine } from '@fortawesome/free-solid-svg-icons';
import { CardComponent } from '../../../../shared/molecules/card/card.component';

@Component({
  selector: 'app-recap-pending-card',
  imports: [CardComponent, FontAwesomeModule],
  templateUrl: './pending-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PendingCardComponent {
  readonly value = input<string>('0');
  readonly faChartLine = faChartLine;
}
