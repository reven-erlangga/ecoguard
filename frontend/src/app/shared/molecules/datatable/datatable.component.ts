import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableComponent } from '../../atoms/table/table/table.component';
import { TableHeaderComponent } from '../../atoms/table/table-header/table-header.component';
import { TableBodyComponent } from '../../atoms/table/table-body/table-body.component';
import { TableRowComponent } from '../../atoms/table/table-row/table-row.component';
import { TableCellComponent } from '../../atoms/table/table-cell/table-cell.component';
import { TablePaginationComponent, DatatablePagination } from '../../atoms/table/table-pagination/table-pagination.component';

export interface DatatableColumn {
  key: string;
  label: string;
  class?: string;
}

@Component({
  selector: 'app-datatable',
  standalone: true,
  imports: [
    CommonModule,
    TableComponent,
    TableHeaderComponent,
    TableBodyComponent,
    TableRowComponent,
    TableCellComponent,
    TablePaginationComponent
  ],
  templateUrl: './datatable.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'block w-full'
  }
})
export class DatatableComponent {
  title = input<string>('');
  subtitle = input<string>('');
  columns = input<DatatableColumn[]>([]);
  loading = input<boolean>(false);
  pagination = input<DatatablePagination | null>(null);

  rowClick = output<any>();
  pagePrev = output<void>();
  pageNext = output<void>();
}
