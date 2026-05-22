import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableCellComponent } from '../../../../../shared/atoms/table/table-cell/table-cell.component';
import { ButtonShimmerComponent } from '../../../../../shared/atoms/button/shimmer/shimmer.component';

@Component({
  selector: 'tr[app-issue-datatable-loading]',
  standalone: true,
  imports: [
    CommonModule,
    TableCellComponent,
    ButtonShimmerComponent
  ],
  templateUrl: './loading.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IssueDatatableLoadingComponent { }
