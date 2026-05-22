import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Issue } from '../../models/issue-detail.model';
import { CardComponent } from '../../../../../shared/molecules/card/card.component';
import { IssueStatus } from '../../../shared/enums/status.enum';
import { IconDefinition } from '@fortawesome/fontawesome-common-types';
import {
  faBolt,
  faCheckCircle,
  faClock,
  faCircleInfo,
  faCircleQuestion,
  faCircleXmark,
  faLock,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-issue-info',
  standalone: true,
  imports: [CommonModule, CardComponent, FontAwesomeModule],
  templateUrl: './info.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IssueInfoComponent {
  @Input({ required: true }) issue!: Issue;

  protected readonly IssueStatus = IssueStatus;

  protected get statusMeta(): {
    badgeColor: string;
    icon: IconDefinition;
    pillBg: string;
    pillTextClass: string;
  } {
    switch (this.issue.status) {
      case IssueStatus.PENDING:
        return {
          badgeColor: '#facc15',
          icon: faClock,
          pillBg: '#facc15',
          pillTextClass: 'text-black',
        };
      case IssueStatus.IN_PROGRESS:
        return {
          badgeColor: '#3b82f6',
          icon: faBolt,
          pillBg: '#3b82f6',
          pillTextClass: 'text-white',
        };
      case IssueStatus.RESOLVED:
        return {
          badgeColor: '#22c55e',
          icon: faCheckCircle,
          pillBg: '#22c55e',
          pillTextClass: 'text-black',
        };
      case IssueStatus.UNRESOLVED:
        return {
          badgeColor: '#ef4444',
          icon: faCircleXmark,
          pillBg: '#ef4444',
          pillTextClass: 'text-white',
        };
      case IssueStatus.NEED_INFO:
        return {
          badgeColor: '#a855f7',
          icon: faCircleInfo,
          pillBg: '#a855f7',
          pillTextClass: 'text-white',
        };
      case IssueStatus.CLOSED:
        return {
          badgeColor: '#111827',
          icon: faLock,
          pillBg: '#111827',
          pillTextClass: 'text-white',
        };
      default:
        return {
          badgeColor: '#9ca3af',
          icon: faCircleQuestion,
          pillBg: '#9ca3af',
          pillTextClass: 'text-black',
        };
    }
  }
}
