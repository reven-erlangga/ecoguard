import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-number-box',
  imports: [],
  template: `<ng-content>{{ value() }}</ng-content>`,
  host: {
    '[class]': '"absolute -top-5 -left-5 w-14 h-14 text-black flex items-center justify-center font-black font-mono text-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-10 " + rotationClass()',
    '[style.background-color]': 'color()'
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NumberBoxComponent {
  value = input<string>('');
  color = input<string>('#FFC72C');
  rotationClass = input<string>('rotate-[-6deg]');
}
