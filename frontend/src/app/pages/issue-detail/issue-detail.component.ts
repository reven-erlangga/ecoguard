import { ChangeDetectionStrategy, Component, signal, inject, effect, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { IssueDetailFacade } from '../../features/issue/detail/facades/issue-detail.facade';
import { ButtonComponent } from '../../shared/atoms/button/button.component';
import { IssueLoadingComponent } from '../../features/issue/detail/components/loading/loading.component';
import { IssueInfoComponent } from '../../features/issue/detail/components/info/info.component';
import { IssueTweetComponent } from '../../features/issue/detail/components/tweet/tweet.component';
import { IssueNotFoundComponent } from '../../features/issue/detail/components/not-found/not-found.component';

import { MainTemplateComponent } from '../../shared/templates/main-template/main-template.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { IssueLocationComponent } from "../../features/issue/detail/components/location/location.component";
import { IssueSolutionComponent } from '../../features/issue/detail/components/solution/solution.component';

@Component({
  selector: 'app-issue-detail',
  imports: [CommonModule, RouterModule, ButtonComponent, MainTemplateComponent, FontAwesomeModule, IssueLoadingComponent, IssueInfoComponent, IssueTweetComponent, IssueNotFoundComponent, IssueLocationComponent, IssueSolutionComponent],

  templateUrl: './issue-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IssueDetailComponent {
  private route = inject(ActivatedRoute);
  protected facade = inject(IssueDetailFacade);
  trackingId = signal(this.route.snapshot.paramMap.get('id'));

  faArrowLeft = faArrowLeft;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    const id = this.trackingId();
    if (id) {
      this.facade.getIssueById(id);
    }

    // Effect to dynamically initialize Leaflet map and trigger Twitter embed loader script when issue loads
    effect(() => {
      const issue = this.facade.selectedIssue();
      if (!issue) return;

      // Guard for SSR: only run browser-specific code in browser environment
      if (!isPlatformBrowser(this.platformId)) return;

      // Trigger Twitter widgets parser load
      if (issue.source_tweet_id) {
        setTimeout(() => {
          const win = window as any;
          if (win.twttr?.widgets) {
            win.twttr.widgets.load();
          }
        }, 150);
      }
    });
  }

  copyToClipboard(text: string) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      alert('Copied to clipboard!');
    }
  }
}
