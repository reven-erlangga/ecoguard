import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'tbody[app-table-body]',
  templateUrl: './table-body.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'w-full'
  },
  styles: [`
    :host {
      display: table-row-group !important;
      width: 100% !important;
    }
  `]
})
export class TableBodyComponent {}
