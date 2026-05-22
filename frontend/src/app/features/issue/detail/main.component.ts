import { ChangeDetectionStrategy, Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IssueDetailFacade } from './facades/issue-detail.facade';
import { IssueInfoComponent } from './components/info/info.component';
import { IssueActionsComponent } from './components/actions/actions.component';
import { IssueLoadingComponent } from './components/loading/loading.component';
import { IssueStatus } from './models/issue-detail.model';

@Component({
  selector: 'app-issue-detail-main',
  standalone: true,
  imports: [
    CommonModule,
    IssueInfoComponent,
    IssueActionsComponent,
    IssueLoadingComponent
  ],
  templateUrl: './main.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainComponent implements OnInit {
  @Input() id!: string;
  protected facade = inject(IssueDetailFacade);

  ngOnInit() {
    if (this.id) {
      this.facade.getIssueById(this.id);
    }
  }

  handleStatusUpdate(status: IssueStatus) {
    this.facade.updateIssueStatus(this.id, status);
  }
}
