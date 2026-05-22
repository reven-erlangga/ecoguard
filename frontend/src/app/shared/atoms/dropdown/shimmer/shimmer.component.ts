import { Component, input, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dropdown-shimmer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './shimmer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'relative block'
  }
})
export class DropdownShimmerComponent {
  itemsCount = input<number>(2);
  className = input<string>('');

  items = computed(() => Array(this.itemsCount()).fill(0));

  shimmerClasses = computed(() => {
    const base = 'absolute right-0 mt-1.5 bg-white border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] z-30 font-mono text-[10px] font-black uppercase overflow-hidden';
    return `${base} ${this.className()}`.trim();
  });
}
