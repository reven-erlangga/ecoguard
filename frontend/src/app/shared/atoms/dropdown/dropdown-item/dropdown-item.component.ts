import { Component, input, output, computed } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dropdown-item',
  templateUrl: './dropdown-item.component.html',
  imports: [RouterModule]
})
export class DropdownItemComponent {
  to = input<string | undefined>(undefined);
  baseClassName = input<string>('block w-full text-left px-3 py-2 border-b-2 border-black last:border-b-0 flex items-center gap-1 transition-all cursor-pointer');
  className = input<string>('');
  
  itemClick = output<void>();
  click = output<void>();

  combinedClasses = computed(() => {
    return `${this.baseClassName()} ${this.className()}`.trim();
  });

  handleClick(event: Event) {
    if (!this.to()) {
      event.preventDefault();
    }
    this.click.emit();
    this.itemClick.emit();
  }
}