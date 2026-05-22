import { Component, input, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-badge-shimmer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './shimmer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'inline-block'
  }
})
export class BadgeShimmerComponent {
  size = input<'sm' | 'md'>('md');
  className = input<string>('');

  shimmerClasses = computed(() => {
    const base = 'animate-pulse border-2 border-gray-300 bg-gray-200 inline-block transition-all duration-200';
    
    const sizeStyles = {
      sm: 'h-5 w-14',
      md: 'h-6 w-20'
    };

    return `${base} ${sizeStyles[this.size()]} ${this.className()}`.trim();
  });
}
