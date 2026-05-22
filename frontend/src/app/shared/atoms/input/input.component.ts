import { ChangeDetectionStrategy, Component, input, model, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './input.component.html',
  styles: [`
    :host { display: block; width: 100%; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InputComponent {
  type = input<string>('text');
  placeholder = input<string>('');
  value = model<string>('');
  disabled = input<boolean>(false);
  className = input<string>('');

  prefix = input<boolean>(false);
  suffix = input<boolean>(false);

  inputClasses = computed(() => {
    const isPassword = this.type() === 'password';
    const fontClass = isPassword ? 'font-sans' : 'font-mono';
    const base = `w-full border-4 border-black p-3 ${fontClass} text-xs bg-white focus:outline-none focus:bg-amber-50 placeholder-gray-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed`;
    const paddingLeft = this.prefix() ? 'pl-12' : 'pl-3';
    const paddingRight = this.suffix() ? 'pr-12' : 'pr-3';
    return `${base} ${paddingLeft} ${paddingRight} ${this.className()}`.trim();
  });

  onInput(event: Event) {
    const inputEl = event.target as HTMLInputElement;
    this.value.set(inputEl.value);
  }
}
