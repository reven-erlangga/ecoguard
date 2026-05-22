import { Component, input, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button-shimmer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './shimmer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'inline-block'
  }
})
export class ButtonShimmerComponent {
  size = input<'sm' | 'md' | 'lg'>('md');
  className = input<string>('');

  shimmerClasses = computed(() => {
    const base = 'animate-pulse border-2 border-gray-300 bg-gray-200 inline-block transition-all duration-200';
    
    const sizeStyles = {
      sm: 'h-8 w-8 shadow-[2px_2px_0px_0px_rgba(200,200,200,1)]',
      md: 'h-10 w-10 shadow-[4px_4px_0px_0px_rgba(200,200,200,1)]',
      lg: 'h-12 w-12 shadow-[6px_6px_0px_0px_rgba(200,200,200,1)]'
    };

    return `${base} ${sizeStyles[this.size()]} ${this.className()}`.trim();
  });
}
