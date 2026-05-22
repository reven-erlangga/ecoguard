import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecapFacade } from './facades/load.facade';
import { PendingCardComponent } from './components/pending-card/pending-card.component';
import { RecapResolvedCardComponent } from './components/resolved-card/resolved-card.component';
import { UnresolvedCardComponent } from './components/unresolved-card/unresolved-card.component';
import { RecapLoadingComponent } from './components/loading/loading.component';

@Component({
  selector: 'app-recap-main',
  standalone: true,
  imports: [
    CommonModule,
    PendingCardComponent,
    RecapResolvedCardComponent,
    UnresolvedCardComponent,
    RecapLoadingComponent
  ],
  templateUrl: './main.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecapMainComponent {
  protected facade = inject(RecapFacade);
}
