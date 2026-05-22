import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CardComponent } from '../../molecules/card/card.component';

@Component({
  selector: 'app-tutorial-card',
  imports: [CardComponent],
  templateUrl: './tutorial-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block h-full'
  }
})
export class TutorialCardComponent {
  title = input.required<string>();
  subtitle = input<string>('');
  bgClass = input<string>('bg-white');
  badge = input<string>('');
  badgeColor = input<string>('#FFC72C');
  badgeRotate = input<string>('rotate-[-6deg]');
  
  // Icon and content inputs
  icon = input.required<'lightning' | 'twitter' | 'list' | 'map'>();
  description = input.required<string>();
  checklist = input<string[]>([]);
  tweetCode = input<string>('');
}
