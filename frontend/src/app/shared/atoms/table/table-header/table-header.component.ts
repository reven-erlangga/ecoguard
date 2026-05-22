import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'thead[app-table-header]',
  templateUrl: './table-header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'w-full'
  },
  styles: [`
    :host {
      display: table-header-group !important;
      width: 100% !important;
      background: black !important;
    }
  `]
})
export class TableHeaderComponent {}
