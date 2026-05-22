import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from '../../../../shared/services/api.service';
import { IIssueResponse, Issue, IssueStatus } from '../models/issue-detail.model';
import { map } from 'rxjs/operators';

type ApiEnvelope<T> = { success: boolean; message?: string; data: T };

@Injectable({
  providedIn: 'root'
})
export class IssueDetailFacade {
  private api = inject(ApiService);
  
  loading = signal<boolean>(false);
  selectedIssue = signal<Issue | null>(null);

  getIssueById(id: string) {
    this.loading.set(true);
    this.api.get<IIssueResponse | ApiEnvelope<IIssueResponse>>(`issue/${id}`).pipe(
      map((res) => this.mapToIssue(this.unwrapIssue(res)))
    ).subscribe({
      next: (data) => {
        this.selectedIssue.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load issue detail', err);
        this.loading.set(false);
      }
    });
  }

  updateIssueStatus(id: string, status: IssueStatus) {
    this.api.patch<IIssueResponse | ApiEnvelope<IIssueResponse>>(`issue/${id}`, { status }).pipe(
      map((res) => this.mapToIssue(this.unwrapIssue(res)))
    ).subscribe({
      next: (updated) => {
        this.selectedIssue.set(updated);
      },
      error: (err) => console.error('Failed to update issue status', err)
    });
  }

  private unwrapIssue(res: IIssueResponse | ApiEnvelope<IIssueResponse>): IIssueResponse {
    const maybeEnvelope = res as ApiEnvelope<IIssueResponse>;
    return maybeEnvelope && typeof maybeEnvelope === 'object' && 'data' in maybeEnvelope ? maybeEnvelope.data : (res as IIssueResponse);
  }

  private mapToIssue(res: IIssueResponse): Issue {
    return {
      id: res.id,
      source_tweet_id: res.source_tweet_id,
      title: res.title,
      description: res.description || res.content || '',
      status: res.status,
      severity: res.severity,
      location: res.location,
      category_id: res.category_id || (res as any).issue_category_id,
      metadata: res.metadata,
      createdAt: new Date(res.created_at || (res as any).createdAt || new Date()),
      updatedAt: new Date(res.updated_at || (res as any).updatedAt || new Date()),
      category: res.category,
      latestResolution: res.latest_resolution ?? null,
    };
  }
}
