import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { CardComponent } from '../../../../../shared/molecules/card/card.component';
import { Issue } from '../../models/issue-detail.model';
import { IconDefinition } from '@fortawesome/fontawesome-common-types';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCheckCircle, faCircleXmark, faCircleQuestion, faImage, faNoteSticky } from '@fortawesome/free-solid-svg-icons';
import { IssueStatus } from '../../../shared/enums/status.enum';

@Component({
  selector: 'app-issue-solution',
  imports: [CommonModule, CardComponent, FontAwesomeModule, DatePipe],
  templateUrl: './solution.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IssueSolutionComponent {
  @Input({ required: true }) issue!: Issue;

  protected readonly faNoteSticky = faNoteSticky;
  protected readonly faImage = faImage;
  protected readonly IssueStatus = IssueStatus;

  protected get resolutionMeta(): { badgeColor: string; icon: IconDefinition; label: string; pillTextClass: string } {
    const status = this.issue.latestResolution?.status ?? this.issue.status;

    switch (status) {
      case IssueStatus.RESOLVED:
        return { badgeColor: '#22c55e', icon: faCheckCircle, label: 'RESOLVED', pillTextClass: 'text-black' };
      case IssueStatus.UNRESOLVED:
        return { badgeColor: '#ef4444', icon: faCircleXmark, label: 'UNRESOLVED', pillTextClass: 'text-white' };
      default:
        return { badgeColor: '#9ca3af', icon: faCircleQuestion, label: status, pillTextClass: 'text-black' };
    }
  }
}
