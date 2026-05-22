import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCircleCheck } from '@fortawesome/free-solid-svg-icons';
import { CardComponent } from '../../../../shared/molecules/card/card.component';

@Component({
  selector: 'app-recap-resolved-card',
  imports: [CardComponent, FontAwesomeModule],
  templateUrl: './resolved-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecapResolvedCardComponent {
  readonly value = input<string>('0');
  readonly faCircleCheck = faCircleCheck;
}
