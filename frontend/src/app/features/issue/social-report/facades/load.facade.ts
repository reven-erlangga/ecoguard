import { inject, Injectable, signal } from '@angular/core';
import { SocialReport } from '../models/social-report.model';
import { ApiService } from '../../../../shared/services/api.service';
import { finalize } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SocialReportLoadFacade {
  private api = inject(ApiService);
  readonly limit = 3;

  data = signal<SocialReport[]>([]);
  loading = signal<boolean>(false);
  currentPage = signal<number>(1);
  totalPages = signal<number>(1);

  // Filter Signals
  search = signal<string>('');
  selectedCategory = signal<string>('');
  selectedStatus = signal<string>('');
  categories = signal<{ id: string; name: string }[]>([]);

  private searchTimeout: any;

  constructor() {
    this.loadCategories();
    this.loadReports();
  }

  loadCategories() {
    this.api.get<any[]>('report/category').subscribe({
      next: (res) => {
        if (Array.isArray(res)) {
          this.categories.set(res.map(c => ({ id: c.id, name: (c.name as string).replace(/\s*\(.*?\)\s*$/, '').trim() })));
        }
      },
      error: (err) => {
        console.error('Failed to load categories', err);
      }
    });
  }

  setSearch(val: string) {
    this.search.set(val);
    this.currentPage.set(1);

    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    this.searchTimeout = setTimeout(() => {
      this.loadReports();
    }, 300);
  }

  setCategory(val: string) {
    this.selectedCategory.set(val);
    this.currentPage.set(1);
    this.loadReports();
  }

  setStatus(val: string) {
    this.selectedStatus.set(val);
    this.currentPage.set(1);
    this.loadReports();
  }

  loadReports() {
    this.loading.set(true);

    const queryParams: any = {
      page: this.currentPage(),
      limit: this.limit
    };

    const searchVal = this.search().trim();
    if (searchVal) {
      queryParams.search = searchVal;
    }

    const catId = this.selectedCategory();
    if (catId) {
      queryParams.category_id = catId;
    }

    const statusVal = this.selectedStatus();
    if (statusVal) {
      queryParams.status = statusVal;
    }

    this.api.get<any>('report/socials', queryParams).pipe(
      finalize(() => this.loading.set(false))
    ).subscribe({
      next: (res) => {
        if (res && Array.isArray(res.data)) {
          this.data.set(res.data);
          this.totalPages.set(res.total_pages || res.totalPages || 1);
        } else if (Array.isArray(res)) {
          this.data.set(res);
          this.totalPages.set(Math.ceil(res.length / this.limit) || 1);
        } else {
          this.data.set([]);
          this.totalPages.set(1);
        }
      },
      error: (err) => {
        console.error('Failed to load social reports', err);
        this.data.set([]);
        this.totalPages.set(1);
      }
    });
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
      this.loadReports();
    }
  }

  prevPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
      this.loadReports();
    }
  }
}
