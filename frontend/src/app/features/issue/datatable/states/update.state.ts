import { Injectable, computed, signal } from '@angular/core';
import { IssueStatus } from '../models/issue-datatable.model';

/**
 * IssueUpdateState
 *
 * Responsibility: form field state + derived validation signals for updating an issue.
 * Does NOT know about HTTP, routing, or the store.
 */
@Injectable({
  providedIn: 'root'
})
export class IssueUpdateState {
  // ─── Raw field signals ───────────────────────────────────────────────────
  readonly activeIssueId = signal<string | null>(null);
  readonly status = signal<IssueStatus>('RESOLVED');
  readonly note = signal<string>('');
  readonly imageFile = signal<File | null>(null);
  
  readonly showDialog = signal<boolean>(false);

  // ─── Derived / computed ──────────────────────────────────────────────────
  readonly isValid = computed(() => {
    const noteContent = this.note().trim();
    // Example validation: note must be at least 3 characters
    return noteContent.length >= 3 && this.activeIssueId() !== null;
  });

  // ─── Helper ──────────────────────────────────────────────────────────────
  openDialog(id: string, initialStatus: IssueStatus = 'RESOLVED'): void {
    this.activeIssueId.set(id);
    this.status.set(initialStatus);
    this.note.set('');
    this.imageFile.set(null);
    this.showDialog.set(true);
  }

  closeDialog(): void {
    this.showDialog.set(false);
    setTimeout(() => this.reset(), 300); // delay reset to allow close animation
  }

  reset(): void {
    this.activeIssueId.set(null);
    this.status.set('RESOLVED');
    this.note.set('');
    this.imageFile.set(null);
  }
}
