import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-issue-loading',
  standalone: true,
  templateUrl: './loading.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IssueLoadingComponent {}
