import { ChangeDetectionStrategy, Component } from '@angular/core';
import { StagePendingCardComponent } from './components/pending-card/pending-card.component';
import { StageResolvedCardComponent } from './components/resolved-card/resolved-card.component';
import { StageUnresolvedCardComponent } from './components/unresolved-card/unresolved-card.component';

@Component({
  selector: 'app-stage',
  imports: [
    StagePendingCardComponent,
    StageResolvedCardComponent,
    StageUnresolvedCardComponent
  ],
  templateUrl: './main.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block'
  }
})
export class StageComponent {}
