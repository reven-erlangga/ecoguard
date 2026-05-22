import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CardComponent } from '../../../../../shared/molecules/card/card.component';
import { StageFacade } from '../../facades/stage.facade';

@Component({
  selector: 'app-stage-unresolved-card',
  imports: [CardComponent],
  templateUrl: './unresolved-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block'
  }
})
export class StageUnresolvedCardComponent {
  protected stageFacade = inject(StageFacade);
}
