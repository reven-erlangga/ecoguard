import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-social-report-loading',
  template: `
    <div class="space-y-4 animate-pulse">
      @for (i of [1,2,3]; track i) {
        <div class="border-3 border-black p-4 bg-white shadow-[5px_5px_0px_0px_rgba(0,0,0,0.15)] flex gap-4 opacity-75">
          <div class="w-12 h-12 bg-gray-200 border-3 border-black shrink-0"></div>
          <div class="flex-1 space-y-3">
            <div class="h-4 bg-gray-200 w-1/4 border border-gray-300"></div>
            <div class="h-3 bg-gray-200 w-full border border-gray-300"></div>
            <div class="h-3 bg-gray-200 w-2/3 border border-gray-300"></div>
          </div>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingComponent {}
