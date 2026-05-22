import { ChangeDetectionStrategy, Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-heading',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './heading.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeadingComponent {
  level = input<'h1' | 'h2' | 'h3' | 'h4'>('h2');
  text = input<string>('');
  border = input<boolean>(false);
  className = input<string>('');

  headingClasses = computed(() => {
    const base = 'font-black uppercase tracking-tight font-mono text-black';
    const levelStyles = {
      h1: 'text-2xl',
      h2: 'text-xl',
      h3: 'text-lg',
      h4: 'text-sm'
    };
    const borderStyle = this.border() ? 'border-b-4 border-black pb-2 mb-2' : '';
    return `${base} ${levelStyles[this.level()]} ${borderStyle} ${this.className()}`.trim();
  });
}
