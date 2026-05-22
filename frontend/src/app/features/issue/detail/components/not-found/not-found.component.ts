import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonComponent } from '../../../../../shared/atoms/button/button.component';

@Component({
  selector: 'app-issue-not-found',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonComponent],
  templateUrl: './not-found.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IssueNotFoundComponent { }
