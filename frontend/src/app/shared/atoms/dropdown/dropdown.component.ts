import { Component, input, output, ElementRef, viewChild, AfterViewInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-dropdown',
  templateUrl: './dropdown.component.html'
})
export class DropdownComponent implements AfterViewInit, OnDestroy {
  isOpen = input<boolean>(false);
  className = input<string>('');
  close = output<void>();

  dropdownRef = viewChild<ElementRef<HTMLDivElement>>('dropdownRef');

  private handleClickOutside = (event: MouseEvent) => {
    const el = this.dropdownRef();
    if (
      this.isOpen() &&
      el &&
      el.nativeElement &&
      !el.nativeElement.contains(event.target as Node) &&
      !(event.target as HTMLElement).closest('.dropdown-toggle')
    ) {
      this.close.emit();
    }
  };

  ngAfterViewInit() {
    if (typeof document !== 'undefined') {
      document.addEventListener('mousedown', this.handleClickOutside);
    }
  }

  ngOnDestroy() {
    if (typeof document !== 'undefined') {
      document.removeEventListener('mousedown', this.handleClickOutside);
    }
  }
}