import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'inline-block'
  }
})
export class ButtonComponent {
  type = input<'button' | 'submit' | 'reset'>('button');
  variant = input<'primary' | 'outline' | 'white'>('primary');
  size = input<'sm' | 'md' | 'lg'>('md');
  disabled = input<boolean>(false);
  loading = input<boolean>(false);
  className = input<string>('');

  btnClick = output<MouseEvent>();

  buttonClasses = computed(() => {
    const base = '!p-3 font-mono font-black uppercase transition-all duration-200 border-2 border-black inline-flex items-center justify-center';

    const variantStyles = {
      primary: this.disabled() || this.loading()
        ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
        : 'bg-amber-400 text-black cursor-pointer hover:bg-amber-300',
      outline: 'bg-transparent text-black cursor-pointer',
      white: 'bg-white text-black cursor-pointer'
    };

    const sizeStyles = {
      sm: 'px-3 py-1 text-[10px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none',
      md: 'px-6 py-2 text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none',
      lg: 'px-8 py-3 text-sm shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none'
    };

    const sizeClass = (this.disabled() || this.loading())
      ? sizeStyles[this.size()].replace(/shadow-\[[\w_,.()\d]+\]/g, '').replace(/hover:shadow-\[[\w_,.()\d]+\]/g, '').replace(/active:[^\s]*/g, '').trim()
      : sizeStyles[this.size()];

    return `${base} ${variantStyles[this.variant()]} ${sizeClass} ${this.className()}`.trim();
  });

  onClick(event: MouseEvent) {
    if (!this.disabled() && !this.loading()) {
      this.btnClick.emit(event);
    }
  }
}
