import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'table[app-table]',
  templateUrl: './table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'w-full'
  },
  styles: [`
    :host {
      display: table !important;
      width: 100% !important;
      table-layout: fixed !important;
      border-collapse: collapse !important;
      border-spacing: 0 !important;
      border: 4px solid black !important;
      background: white !important;
    }
  `]
})
export class TableComponent {}