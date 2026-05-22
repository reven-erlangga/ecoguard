import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../button/button.component';

export interface DatatablePagination {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
}

@Component({
  selector: 'app-table-pagination',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './table-pagination.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'block w-full'
  }
})
export class TablePaginationComponent {
  pagination = input<DatatablePagination | null>(null);
  loading = input<boolean>(false);
  
  pagePrev = output<void>();
  pageNext = output<void>();
}
