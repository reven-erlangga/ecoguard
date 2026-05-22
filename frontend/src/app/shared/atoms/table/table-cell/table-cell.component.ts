import { Component, input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'td[app-table-cell], th[app-table-cell]',
  templateUrl: './table-cell.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'getCellClasses()',
    '[attr.colspan]': 'colspan()'
  },
  styles: [`
    :host {
      display: table-cell !important;
      vertical-align: middle !important;
      border-bottom: 2px solid black !important;
    }
  `]
})
export class TableCellComponent {
  isHeader = input<boolean>(false);
  colspan = input<number>(1);

  getCellClasses(): string {
    const base = 'px-6 py-4 text-left font-mono tracking-tighter transition-colors';
    const headerClasses = 'bg-black text-white font-black uppercase text-xs border-black';
    const cellClasses = 'bg-white text-black font-bold text-sm border-black';

    return `${base} ${this.isHeader() ? headerClasses : cellClasses}`;
  }
}
