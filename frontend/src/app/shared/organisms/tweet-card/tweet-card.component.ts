import { ChangeDetectionStrategy, Component, ElementRef, PLATFORM_ID, effect, input, signal, viewChild, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { CardComponent } from '../../molecules/card/card.component';
import { faXTwitter } from '@fortawesome/free-brands-svg-icons';
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

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
  selector: 'app-tweet-card',
  standalone: true,
  imports: [CommonModule, CardComponent, FontAwesomeModule],
  templateUrl: './tweet-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TweetCardComponent {
  readonly faXTwitter = faXTwitter;
  readonly faTriangleExclamation = faTriangleExclamation;
  public isBrowser: boolean;

  tweetId = input<string | undefined | null>(undefined);
  readonly renderState = signal<'idle' | 'loading' | 'loaded' | 'error'>('idle');
  private readonly tweetTarget = viewChild<ElementRef<HTMLElement>>('tweetTarget');
  private lastRenderedId: string | null = null;
  private inFlightId: string | null = null;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);

    effect(() => {
      if (!this.isBrowser) return;

      const id = this.tweetId();
      if (!this.isRealTweet(id)) {
        this.renderState.set('idle');
        this.inFlightId = null;
        return;
      }

      const target = this.tweetTarget()?.nativeElement;
      if (!target) return;

      if (this.inFlightId === id) return;
      if (this.lastRenderedId === id && target.childElementCount > 0) return;

      this.inFlightId = id;
      this.renderState.set('loading');
      target.replaceChildren();

      loadTwitterWidgets()
        .then(() => {
          const win = window as any;
          if (!win.twttr?.widgets) throw new Error('Twitter widgets unavailable');
          if (typeof win.twttr.widgets.createTweet !== 'function') throw new Error('createTweet unavailable');

          return win.twttr.widgets.createTweet(id, target, {
            align: 'center',
            theme: 'light',
            dnt: true,
          });
        })
        .then(() => {
          if (this.inFlightId !== id) return;
          this.lastRenderedId = id;
          this.inFlightId = null;
          this.renderState.set('loaded');
        })
        .catch(() => {
          if (this.inFlightId === id) this.inFlightId = null;
          this.renderState.set('error');
        });
    });
  }

  /**
   * Determines if the provided tweetId looks like a real Twitter status ID.
   */
  isRealTweet(id: string | undefined | null): id is string {
    return !!id && /^\d+$/.test(id);
  }
}
