import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-main-template',
  imports: [],
  templateUrl: './main-template.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainTemplateComponent {
  title = input.required<string>();
  subtitle = input<string>('');
}
