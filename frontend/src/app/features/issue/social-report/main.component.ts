import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SocialReportLoadFacade } from './facades/load.facade';
import { HeaderComponent } from './components/header/header.component';
import { ListComponent } from './components/list/list.component';
import { PaginationComponent } from './components/pagination/pagination.component';
import { LoadingComponent } from './components/loading/loading.component';
import { InputComponent } from '../../../shared/atoms/input/input.component';
import { ButtonComponent } from '../../../shared/atoms/button/button.component';
import { DropdownComponent } from '../../../shared/atoms/dropdown/dropdown.component';
import { DropdownItemComponent } from '../../../shared/atoms/dropdown/dropdown-item/dropdown-item.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faFilter, faChevronDown } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-social-report',
  imports: [
    CommonModule,
    HeaderComponent,
    ListComponent,
    PaginationComponent,
    LoadingComponent,
    InputComponent,
    ButtonComponent,
    DropdownComponent,
    DropdownItemComponent,
    FontAwesomeModule
  ],
  host: { class: 'block' },
  templateUrl: './main.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SocialReportComponent {
  protected facade = inject(SocialReportLoadFacade);

  isFilterOpen = signal<boolean>(false);
  isStatusOpen = signal<boolean>(false);
  isCategoryOpen = signal<boolean>(false);

  faFilter = faFilter;
  faChevronDown = faChevronDown;

  getCategoryName(id: string): string {
    if (!id) return 'ALL CATEGORIES';
    const cat = this.facade.categories().find(c => c.id === id);
    return cat ? cat.name : 'ALL CATEGORIES';
  }
}
