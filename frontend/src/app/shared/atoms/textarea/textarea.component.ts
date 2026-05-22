import { ChangeDetectionStrategy, Component, input, model, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-textarea',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './textarea.component.html',
  styles: [`
    :host { display: block; width: 100%; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TextareaComponent {
  placeholder = input<string>('');
  value = model<string>('');
  disabled = input<boolean>(false);
  className = input<string>('');
  rows = input<number>(3);

  textareaClasses = computed(() => {
    const base = 'w-full border-4 border-black p-3 font-mono text-xs uppercase bg-white focus:outline-none focus:bg-amber-50 placeholder-gray-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed';
    return `${base} ${this.className()}`.trim();
  });

  onInput(event: Event) {
    const textareaEl = event.target as HTMLTextAreaElement;
    this.value.set(textareaEl.value);
  }
}
