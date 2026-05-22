import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../../../../shared/atoms/button/button.component';

@Component({
  selector: 'app-social-report-pagination',
  imports: [CommonModule, ButtonComponent],
  templateUrl: './pagination.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginationComponent {
  currentPage = input.required<number>();
  totalPages = input.required<number>();
  
  prev = output<void>();
  next = output<void>();
}
