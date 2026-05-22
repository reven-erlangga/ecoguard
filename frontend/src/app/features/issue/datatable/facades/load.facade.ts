import { inject, Injectable, PLATFORM_ID, computed } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { forkJoin, timer } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import { IssueDatatableService } from '../services/issue-datatable.service';
import { IssueDatatableStore } from '../stores/issue-datatable.store';
import { IIssueResponse, Issue } from '../models/issue-datatable.model';

@Injectable({
  providedIn: 'root'
})
export class IssueLoadFacade {
  private readonly service = inject(IssueDatatableService);
  private readonly store = inject(IssueDatatableStore);
  private readonly platformId = inject(PLATFORM_ID);

  private searchTimeout: any;

  // ─── Exposed Signals ──────────────────────────────────────────────────────
  readonly issues = this.store.issues;
  readonly loading = this.store.loading;
  readonly pagination = this.store.pagination;
  readonly search = this.store.search;
  readonly selectedCategory = this.store.selectedCategory;
  readonly selectedStatus = this.store.selectedStatus;
  readonly categories = this.store.categories;
  readonly alert = this.store.alert;

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadCategories();
    }
  }

  // ─── Actions ──────────────────────────────────────────────────────────────
  showAlert(message: string, type: 'success' | 'error' | 'info') {
    this.store.setAlert({ show: true, message, type });
    setTimeout(() => {
      this.store.setAlert({ show: false, message: '', type: null });
    }, 4000);
  }
  
  clearAlert() {
    this.store.setAlert({ show: false, message: '', type: null });
  }

  loadCategories() {
    this.service.getCategories().subscribe({
      next: (res) => {
        if (Array.isArray(res)) {
          this.store.setCategories(res.map(c => ({ 
            id: c.id, 
            name: (c.name as string).replace(/\s*\(.*?\)\s*$/, '').trim() 
          })));
        }
      },
      error: (err) => {
        console.error('Failed to load categories', err);
      }
    });
  }

  setSearch(val: string) {
    this.store.setSearch(val);
    this.store.updatePagination({ currentPage: 1 });

    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    this.searchTimeout = setTimeout(() => {
      this.loadIssues();
    }, 300);
  }

  setCategory(val: string) {
    this.store.setSelectedCategory(val);
    this.store.updatePagination({ currentPage: 1 });
    this.loadIssues();
  }

  setStatus(val: string) {
    this.store.setSelectedStatus(val);
    this.store.updatePagination({ currentPage: 1 });
    this.loadIssues();
  }

  loadIssues() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.store.setLoading(true);

    const pagination = this.store.pagination();
    const page = pagination.currentPage;
    const limit = pagination.pageSize;
    const searchVal = this.store.search().toLowerCase().trim();
    const category_id = this.store.selectedCategory();
    const status = this.store.selectedStatus();

    const queryParams: any = { page, limit };
    if (searchVal) queryParams.search = this.store.search();
    if (category_id) queryParams.category_id = category_id;
    if (status) queryParams.status = status;

    forkJoin([
      this.service.getIssues(queryParams),
      timer(600)
    ]).pipe(
      map(([res]) => res),
      finalize(() => this.store.setLoading(false))
    ).subscribe({
      next: (res) => {
        let rawIssues: IIssueResponse[] = [];
        let totalItems = 0;
        let totalPages = 1;

        if (Array.isArray(res)) {
          rawIssues = res;
          totalItems = res.length;
          totalPages = Math.ceil(totalItems / limit) || 1;
        } else if (res && Array.isArray(res.data)) {
          rawIssues = res.data;
          totalItems = res.total ?? res.totalItems ?? res.total_items ?? res.data.length;
          totalPages = res.totalPages ?? res.total_pages ?? res.lastPage ?? res.last_page ?? (Math.ceil(totalItems / limit) || 1);
        } else if (res && res.issues && Array.isArray(res.issues)) {
          rawIssues = res.issues;
          totalItems = res.total ?? res.totalItems ?? res.total_items ?? res.issues.length;
          totalPages = res.totalPages ?? res.total_pages ?? (Math.ceil(totalItems / limit) || 1);
        }

        const mapped = rawIssues.map(item => this.mapToIssue(item));
        this.store.setIssues(mapped);

        this.store.updatePagination({
          totalItems,
          totalPages: totalPages > 0 ? totalPages : 1
        });
      },
      error: (err) => {
        console.error('Failed to load issues from backend:', err);
        this.store.setIssues([]);
        this.store.updatePagination({
          currentPage: 1,
          totalPages: 1,
          totalItems: 0
        });
        this.showAlert('FAILED TO CONNECT TO INCIDENT DATABASE', 'error');
      }
    });
  }

  nextPage() {
    const pagination = this.store.pagination();
    if (pagination.currentPage < pagination.totalPages) {
      this.store.updatePagination({ currentPage: pagination.currentPage + 1 });
      this.loadIssues();
    }
  }

  prevPage() {
    const pagination = this.store.pagination();
    if (pagination.currentPage > 1) {
      this.store.updatePagination({ currentPage: pagination.currentPage - 1 });
      this.loadIssues();
    }
  }

  // ─── Data Mapping ─────────────────────────────────────────────────────────
  mapToIssue(res: any): Issue {
    const source = (res && res.data && (res.data.id || res.data.title)) ? res.data : res;

    return {
      id: source.id || '',
      title: source.title || '',
      description: source.description || '',
      status: source.status || 'PENDING',
      severity: source.severity || 'MEDIUM',
      createdAt: new Date(source.created_at || source.createdAt || new Date()),
      updatedAt: new Date(source.updated_at || source.updatedAt || new Date())
    };
  }
}
