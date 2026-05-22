import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CardComponent } from '../../../../../shared/molecules/card/card.component';
import { StageFacade } from '../../facades/stage.facade';

@Component({
  selector: 'app-stage-resolved-card',
  imports: [CardComponent],
  templateUrl: './resolved-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block'
  }
})
export class StageResolvedCardComponent {
  protected stageFacade = inject(StageFacade);
}
