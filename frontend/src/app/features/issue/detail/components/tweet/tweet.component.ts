import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TweetCardComponent } from '../../../../../shared/organisms/tweet-card/tweet-card.component';

@Component({
  selector: 'app-issue-tweet',
  standalone: true,
  imports: [CommonModule, TweetCardComponent],
  templateUrl: './tweet.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IssueTweetComponent {
  tweetId = input<string | undefined | null>(undefined);

  isRealTweet(id?: string | null): boolean {
    return !!id && /^\\d+$/.test(id);
  }
}
