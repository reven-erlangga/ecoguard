import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Issue } from '../../models/issue-detail.model';
import { MapCardComponent } from '../../../../../shared/organisms/map-card/map-card.component';

@Component({
  selector: 'app-issue-location',
  imports: [MapCardComponent],
  templateUrl: './location.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IssueLocationComponent {
  readonly issue = input<Issue | null>(null);
}
