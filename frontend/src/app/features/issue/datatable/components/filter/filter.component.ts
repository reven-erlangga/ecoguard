import { Component, input, output, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../../../../shared/atoms/button/button.component';
import { DropdownComponent } from '../../../../../shared/atoms/dropdown/dropdown.component';
import { DropdownItemComponent } from '../../../../../shared/atoms/dropdown/dropdown-item/dropdown-item.component';
import { InputComponent } from '../../../../../shared/atoms/input/input.component';
import { ModalComponent } from '../../../../../shared/atoms/modal/modal.component';

@Component({
  selector: 'app-issue-filter',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    DropdownComponent,
    DropdownItemComponent,
    InputComponent,
    ModalComponent
  ],
  templateUrl: './filter.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IssueFilterComponent {
  // Current active filter state from parent
  searchVal = input<string>('');
  statusVal = input<string>('');
  categoryVal = input<string>('');
  categories = input<{ id: string; name: string }[]>([]);

  // Filter selection event outputs
  searchChange = output<string>();
  statusChange = output<string>();
  categoryChange = output<string>();

  // Custom Dropdown & Modal states
  isStatusOpen = signal<boolean>(false);
  isCategoryOpen = signal<boolean>(false);
  isFilterModalOpen = signal<boolean>(false);

  // Local temporary modal selection states
  tempStatus = signal<string>('');
  tempCategory = signal<string>('');

  toggleStatusDropdown() {
    this.isStatusOpen.update(v => !v);
    this.isCategoryOpen.set(false);
  }

  toggleCategoryDropdown() {
    this.isCategoryOpen.update(v => !v);
    this.isStatusOpen.set(false);
  }

  selectStatus(status: string) {
    this.tempStatus.set(status);
    this.isStatusOpen.set(false);
  }

  selectCategory(catId: string) {
    this.tempCategory.set(catId);
    this.isCategoryOpen.set(false);
  }

  getSelectedTempCategoryName(): string {
    const activeId = this.tempCategory();
    if (!activeId) return 'ALL CATEGORIES';
    const match = this.categories().find(c => c.id === activeId);
    return match ? match.name : 'ALL CATEGORIES';
  }

  openFilterModal() {
    // Populate local temporary filters with active filters when opened
    this.tempStatus.set(this.statusVal());
    this.tempCategory.set(this.categoryVal());
    this.isFilterModalOpen.set(true);
  }

  closeFilterModal() {
    this.isFilterModalOpen.set(false);
    this.isStatusOpen.set(false);
    this.isCategoryOpen.set(false);
  }

  applyFilters() {
    this.statusChange.emit(this.tempStatus());
    this.categoryChange.emit(this.tempCategory());
    this.closeFilterModal();
  }

  resetFilters() {
    this.tempStatus.set('');
    this.tempCategory.set('');
    this.statusChange.emit('');
    this.categoryChange.emit('');
    this.closeFilterModal();
  }
}
