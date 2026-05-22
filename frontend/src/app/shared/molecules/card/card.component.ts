import { ChangeDetectionStrategy, Component, ElementRef, contentChild, input } from '@angular/core';
import { NumberBoxComponent } from '../../atoms/number-box/number-box.component';
import { IconDefinition } from '@fortawesome/fontawesome-common-types';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-card',
  imports: [NumberBoxComponent, FaIconComponent],
  templateUrl: './card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block h-full',
  },
})
export class CardComponent {
  title = input.required<string>();
  subtitle = input<string>('');
  value = input<string>('');
  bgClass = input<string>('bg-white');

  // Auto-detect badge content: renders app-number-box only when #badge ref exists in projected content
  hasBadge = contentChild<ElementRef>('badgeSlot');
  badgeColor = input<string>('#FFC72C');
  badgeRotate = input<string>('rotate-[-6deg]');
  badgeIcon = input<IconDefinition | undefined>(undefined);
}
