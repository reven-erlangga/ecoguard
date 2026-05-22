import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

export interface TabItem {
  id: string;
  label: string;
}

@Component({
  selector: 'app-tab',
  template: `
    <nav class="flex px-6 space-x-6 border-b border-gray-200">
      @for (tab of tabs(); track tab.id) {
        <button 
          (click)="selectTab(tab.id)"
          type="button"
          class="py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200"
          [class.border-brand-500]="activeTabId() === tab.id"
          [class.text-brand-600]="activeTabId() === tab.id"
          [class.border-transparent]="activeTabId() !== tab.id"
          [class.text-gray-500]="activeTabId() !== tab.id"
          [class.hover:text-gray-700]="activeTabId() !== tab.id">
          {{ tab.label }}
        </button>
      }
    </nav>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabComponent {
  tabs = input.required<TabItem[]>();
  activeTabId = input.required<string>();
  tabChange = output<string>();

  selectTab(id: string) {
    if (this.activeTabId() !== id) {
      this.tabChange.emit(id);
    }
  }
}
