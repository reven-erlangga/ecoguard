import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotFoundMainComponent } from '../../features/not-found/main.component';

@Component({
  selector: 'app-blank',
  standalone: true,
  imports: [CommonModule, NotFoundMainComponent],
  templateUrl: './blank.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlankComponent {
}
