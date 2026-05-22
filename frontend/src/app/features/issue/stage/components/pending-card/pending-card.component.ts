import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CardComponent } from '../../../../../shared/molecules/card/card.component';
import { StageFacade } from '../../facades/stage.facade';

@Component({
  selector: 'app-stage-pending-card',
  imports: [CardComponent],
  templateUrl: './pending-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block'
  }
})
export class StagePendingCardComponent {
  protected stageFacade = inject(StageFacade);
}
