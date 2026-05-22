import { Component, input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'tr[app-table-row]',
  templateUrl: './table-row.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'getRowClasses()'
  },
  styles: [`
    :host {
      display: table-row !important;
      width: 100% !important;
    }
  `]
})
export class TableRowComponent {
  hoverable = input<boolean>(true);

  getRowClasses(): string {
    const base = 'group transition-all duration-200';
    const hoverClasses = 'hover:bg-gray-50 cursor-pointer';
    
    return `${base} ${this.hoverable() ? hoverClasses : ''}`;
  }
}
