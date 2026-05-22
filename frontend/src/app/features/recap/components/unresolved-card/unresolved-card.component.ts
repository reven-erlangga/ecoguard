import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import { CardComponent } from '../../../../shared/molecules/card/card.component';

@Component({
  selector: 'app-recap-unresolved-card',
  imports: [CardComponent, FontAwesomeModule],
  templateUrl: './unresolved-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UnresolvedCardComponent {
  readonly value = input<string>('0');
  readonly faCircleXmark = faCircleXmark;
}
