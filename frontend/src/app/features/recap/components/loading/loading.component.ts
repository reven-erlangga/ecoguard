import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-recap-loading',
  standalone: true,
  templateUrl: './loading.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecapLoadingComponent {}
