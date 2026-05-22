import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-reduction-trend-loading',
  standalone: true,
  template: `
    <div class="h-64 flex items-end justify-between gap-4 p-4 bg-gray-50 border-2 border-black animate-pulse">
      @for (i of [1,2,3,4,5,6]; track i) {
        <div class="flex-1 bg-gray-200 border-2 border-dashed border-gray-300" [style.height.%]="(i * 15) + 10"></div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingComponent {}
