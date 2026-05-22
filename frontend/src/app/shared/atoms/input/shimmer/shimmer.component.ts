import { Component, input, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-input-shimmer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './shimmer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'block w-full'
  }
})
export class InputShimmerComponent {
  className = input<string>('');

  shimmerClasses = computed(() => {
    const base = 'h-12 w-full animate-pulse border-4 border-gray-300 bg-gray-200 shadow-[4px_4px_0px_0px_rgba(200,200,200,1)] transition-all duration-200';
    return `${base} ${this.className()}`.trim();
  });
}
