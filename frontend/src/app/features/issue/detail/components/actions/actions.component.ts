import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { IssueStatus } from '../../models/issue-detail.model';

@Component({
  selector: 'app-issue-actions',
  standalone: true,
  templateUrl: './actions.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IssueActionsComponent {
  @Output() statusUpdate = new EventEmitter<IssueStatus>();

  onUpdateStatus(status: IssueStatus) {
    this.statusUpdate.emit(status);
  }
}
