import { Injectable, computed, signal } from '@angular/core';
import { Issue, IssuePagination } from '../models/issue-datatable.model';

export interface AlertState {
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'info' | null;
}

@Injectable({
  providedIn: 'root'
})
export class IssueDatatableStore {
  // ─── Private State ────────────────────────────────────────────────────────
  private readonly _issues = signal<Issue[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _pagination = signal<IssuePagination>({
    currentPage: 1,
    totalPages: 1,
    pageSize: 5,
    totalItems: 0
  });

  private readonly _search = signal<string>('');
  private readonly _selectedCategory = signal<string>('');
  private readonly _selectedStatus = signal<string>('');
  private readonly _categories = signal<{ id: string; name: string }[]>([]);

  private readonly _alert = signal<AlertState>({ show: false, message: '', type: null });

  // ─── Public Computed Selectors ────────────────────────────────────────────
  readonly issues = computed(() => this._issues());
  readonly loading = computed(() => this._loading());
  readonly pagination = computed(() => this._pagination());
  readonly search = computed(() => this._search());
  readonly selectedCategory = computed(() => this._selectedCategory());
  readonly selectedStatus = computed(() => this._selectedStatus());
  readonly categories = computed(() => this._categories());
  readonly alert = computed(() => this._alert());

  // ─── Mutations ────────────────────────────────────────────────────────────
  setIssues(data: Issue[]): void {
    this._issues.set(data);
  }

  updateIssue(id: string, updatedData: Partial<Issue>): void {
    this._issues.update(list => list.map(item => {
      if (item.id === id) {
        return { ...item, ...updatedData };
      }
      return item;
    }));
  }

  setLoading(isLoading: boolean): void {
    this._loading.set(isLoading);
  }

  setPagination(pagination: IssuePagination): void {
    this._pagination.set(pagination);
  }

  updatePagination(partial: Partial<IssuePagination>): void {
    this._pagination.update(p => ({ ...p, ...partial }));
  }

  setSearch(val: string): void {
    this._search.set(val);
  }

  setSelectedCategory(val: string): void {
    this._selectedCategory.set(val);
  }

  setSelectedStatus(val: string): void {
    this._selectedStatus.set(val);
  }

  setCategories(cats: { id: string; name: string }[]): void {
    this._categories.set(cats);
  }

  setAlert(alert: AlertState): void {
    this._alert.set(alert);
  }
}
