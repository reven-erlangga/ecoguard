import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, PLATFORM_ID, effect, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '../../../../../shared/atoms/button/button.component';
import { SocialReport } from '../../models/social-report.model';

declare global {
  interface Window {
    twttr?: any;
  }
}

let twitterWidgetsPromise: Promise<void> | null = null;

function loadTwitterWidgets(): Promise<void> {
  if (twitterWidgetsPromise) return twitterWidgetsPromise;

  twitterWidgetsPromise = new Promise((resolve, reject) => {
    const win = window as any;
    if (win.twttr?.widgets) {
      resolve();
      return;
    }

    const existing = document.querySelector('script[data-twitter-widgets="true"]') as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Failed to load Twitter widgets')));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://platform.twitter.com/widgets.js';
    script.async = true;
    script.charset = 'utf-8';
    script.setAttribute('data-twitter-widgets', 'true');
    script.addEventListener('load', () => resolve());
    script.addEventListener('error', () => reject(new Error('Failed to load Twitter widgets')));
    document.head.appendChild(script);
  });

  return twitterWidgetsPromise;
}

@Component({
  selector: 'app-social-report-list',
  imports: [CommonModule, RouterLink, ButtonComponent],
  templateUrl: './list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListComponent {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly rendered = new Map<string, string>();

  reports = input.required<SocialReport[]>();

  constructor() {
    effect(() => {
      if (!this.isBrowser) return;

      const currentReports = this.reports();
      const hasAnyTweet = currentReports.some((r) => this.isRealTweet(r.tweet_id));
      if (!hasAnyTweet) return;

      loadTwitterWidgets()
        .then(() => {
          setTimeout(() => this.renderEmbeds(currentReports), 0);
        })
        .catch(() => {});
    });
  }

  isRealTweet(tweetId: string | null | undefined): tweetId is string {
    return !!tweetId && /^\d+$/.test(tweetId);
  }

  private renderEmbeds(reports: SocialReport[]) {
    const win = window as any;
    const createTweet = win.twttr?.widgets?.createTweet;
    if (typeof createTweet !== 'function') return;

    for (const report of reports) {
      if (!this.isRealTweet(report.tweet_id)) continue;

      const hostId = `tweet-embed-${report.id}`;
      const host = document.getElementById(hostId);
      if (!host) continue;

      const previousTweetId = this.rendered.get(hostId);
      if (previousTweetId === report.tweet_id && host.childElementCount > 0) continue;

      this.rendered.set(hostId, report.tweet_id);
      host.replaceChildren();

      createTweet(report.tweet_id, host, { align: 'center', theme: 'light', dnt: true }).catch(() => {});
    }
  }
}
