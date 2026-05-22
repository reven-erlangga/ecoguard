import { Component, input, output, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatatableComponent } from '../../../../../shared/molecules/datatable/datatable.component';
import { TableRowComponent } from '../../../../../shared/atoms/table/table-row/table-row.component';
import { TableCellComponent } from '../../../../../shared/atoms/table/table-cell/table-cell.component';
import { BadgeComponent } from '../../../../../shared/atoms/badge/badge.component';
import { ButtonComponent } from '../../../../../shared/atoms/button/button.component';
import { DropdownComponent } from '../../../../../shared/atoms/dropdown/dropdown.component';
import { DropdownItemComponent } from '../../../../../shared/atoms/dropdown/dropdown-item/dropdown-item.component';
import { IssueFilterComponent } from '../filter/filter.component';
import { IssueDatatableLoadingComponent } from '../loading/loading.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEye, faGear, faChevronDown, faCheck, faXmark } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-issue-table',
  standalone: true,
  imports: [
    CommonModule,
    DatatableComponent,
    TableRowComponent,
    TableCellComponent,
    BadgeComponent,
    ButtonComponent,
    DropdownComponent,
    DropdownItemComponent,
    IssueFilterComponent,
    IssueDatatableLoadingComponent,
    FontAwesomeModule
  ],
  templateUrl: './table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IssueTableComponent {
  faEye = faEye;
  faGear = faGear;
  faChevronDown = faChevronDown;
  faCheck = faCheck;
  faXmark = faXmark;

  issues = input<any[]>([]);
  loading = input<boolean>(false);
  pagination = input<any>(null);

  // Filter state inputs
  searchVal = input<string>('');
  statusVal = input<string>('');
  categoryVal = input<string>('');
  categories = input<{ id: string; name: string }[]>([]);

  // Filter change outputs
  pagePrev = output<void>();
  pageNext = output<void>();
  viewDetail = output<string>();
  processIssue = output<{ id: string, status: 'RESOLVED' | 'UNRESOLVED' }>();
  
  searchChange = output<string>();
  statusChange = output<string>();
  categoryChange = output<string>();

  // Custom Dropdown Menu Signal States for Row Actions
  openDropdownId = signal<string | null>(null);

  columns = [
    { key: 'title', label: 'TITLE' },
    { key: 'severity', label: 'SEVERITY' },
    { key: 'status', label: 'STATUS' },
    { key: 'createdAt', label: 'CREATED AT' },
    { key: 'actions', label: 'ACTIONS', class: 'text-right' }
  ];

  getSeverityColor(severity: string): any {
    switch (severity) {
      case 'CRITICAL': return 'error';
      case 'HIGH': return 'warning';
      case 'MEDIUM': return 'warning';
      case 'LOW': return 'info';
      default: return 'light';
    }
  }

  getStatusColor(status: string): any {
    switch (status) {
      case 'RESOLVED': return 'success';
      case 'UNRESOLVED': return 'error';
      case 'IN_PROGRESS': return 'primary';
      case 'PENDING': return 'warning';
      case 'NEED_INFO': return 'info';
      case 'CLOSED': return 'dark';
      default: return 'light';
    }
  }

  toggleDropdown(id: string) {
    if (this.openDropdownId() === id) {
      this.openDropdownId.set(null);
    } else {
      this.openDropdownId.set(id);
    }
  }

  selectAction(action: 'RESOLVED' | 'UNRESOLVED', id: string) {
    this.processIssue.emit({ id, status: action });
    this.openDropdownId.set(null);
  }
}
