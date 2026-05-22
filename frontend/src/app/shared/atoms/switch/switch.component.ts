import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-switch',
  template: `
    <label class="relative inline-flex items-center" [class.cursor-pointer]="!disabled()" [class.opacity-50]="disabled()">
      <input 
        type="checkbox" 
        class="sr-only peer" 
        [checked]="checked()" 
        [disabled]="disabled()"
        (change)="onToggle()">
      <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer 
                  peer-checked:after:translate-x-full peer-checked:after:border-white 
                  after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                  after:bg-white after:border-gray-300 after:border after:rounded-full 
                  after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600 
                  transition-colors">
      </div>
    </label>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SwitchComponent {
  checked = input<boolean>(false);
  disabled = input<boolean>(false);
  toggle = output<boolean>();

  onToggle() {
    if (!this.disabled()) {
      this.toggle.emit(!this.checked());
    }
  }
}
