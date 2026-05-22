import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-not-found-heading',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './heading.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFoundHeadingComponent {
}
