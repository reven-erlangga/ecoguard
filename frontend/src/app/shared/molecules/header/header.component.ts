import { ChangeDetectionStrategy, Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeadingComponent } from '../../atoms/heading/heading.component';
import { ParagraphComponent } from '../../atoms/paragraph/paragraph.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, HeadingComponent, ParagraphComponent],
  templateUrl: './header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {
  title = input<string>('');
  subtitle = input<string>('');
  border = input<boolean>(true);
  level = input<'h1' | 'h2' | 'h3' | 'h4'>('h2');
  className = input<string>('');

  containerClasses = computed(() => {
    return `block w-full ${this.className()}`.trim();
  });
}
