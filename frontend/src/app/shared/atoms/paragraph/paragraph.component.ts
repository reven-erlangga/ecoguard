import { ChangeDetectionStrategy, Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-paragraph',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './paragraph.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ParagraphComponent {
  color = input<'normal' | 'muted'>('muted');
  className = input<string>('');

  paragraphClasses = computed(() => {
    const base = 'font-mono text-[10px] uppercase font-bold tracking-wide';
    const colorStyles = {
      normal: 'text-black',
      muted: 'text-gray-500'
    };
    return `${base} ${colorStyles[this.color()]} ${this.className()}`.trim();
  });
}
