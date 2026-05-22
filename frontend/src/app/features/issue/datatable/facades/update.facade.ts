import { computed, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { finalize } from 'rxjs/operators';

import { IssueDatatableService } from '../services/issue-datatable.service';
import { IssueDatatableStore } from '../stores/issue-datatable.store';
import { IssueUpdateState } from '../states/update.state';
import { IssueLoadFacade } from './load.facade';

@Injectable({
  providedIn: 'root'
})
export class IssueUpdateFacade {
  private readonly service = inject(IssueDatatableService);
  private readonly store = inject(IssueDatatableStore);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly _submitting = signal(false);

  // Expose the load facade to share alert functionality and issue mapping
  private readonly loadFacade = inject(IssueLoadFacade);

  // Expose state so component can bind directly to field signals
  readonly form = inject(IssueUpdateState);
  readonly submitting = computed(() => this._submitting());

  onSubmit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (this._submitting()) return;
    if (!this.form.isValid()) return;

    const id = this.form.activeIssueId();
    if (!id) return;

    const status = this.form.status();
    const note = this.form.note();
    const imageFile = this.form.imageFile();

    this.store.setLoading(true);
    this._submitting.set(true);

    const formData = new FormData();
    formData.append('status', status);
    formData.append('note', note);
    if (imageFile) {
      formData.append('image', imageFile);
    }

    this.service.updateIssue(id, formData).pipe(
      finalize(() => {
        this.store.setLoading(false);
        this._submitting.set(false);
      })
    ).subscribe({
      next: (res) => {
        const rawIssueData = res?.data || res;
        const mapped = this.loadFacade.mapToIssue(rawIssueData);

        // Optimistically update the store with the new data
        this.store.updateIssue(id, {
          title: mapped.title,
          description: mapped.description,
          severity: mapped.severity,
          status: mapped.status || status
        });

        this.loadFacade.showAlert(`SUCCESSFULLY UPDATED INCIDENT STATUS: ${id}`, 'success');
        this.form.closeDialog();
      },
      error: (err) => {
        console.error('Failed to update status on server:', err);
        this.loadFacade.showAlert('FAILED TO UPDATE INCIDENT STATUS', 'error');
      }
    });
  }
}
