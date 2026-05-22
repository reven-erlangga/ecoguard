import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AdminTemplateComponent } from '../../shared/templates/admin-template/admin-template.component';
import { TableComponent } from '../../shared/atoms/table/table/table.component';
import { TableHeaderComponent } from '../../shared/atoms/table/table-header/table-header.component';
import { TableBodyComponent } from '../../shared/atoms/table/table-body/table-body.component';
import { TableRowComponent } from '../../shared/atoms/table/table-row/table-row.component';
import { TableCellComponent } from '../../shared/atoms/table/table-cell/table-cell.component';

@Component({
  selector: 'app-profile',
  imports: [
    AdminTemplateComponent,
    TableComponent, TableHeaderComponent, TableBodyComponent,
    TableRowComponent, TableCellComponent
  ],
  templateUrl: './profile.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent {
}
