import { ChangeDetectionStrategy, Component } from '@angular/core';

import { TutorialCardComponent } from '../../shared/organisms/tutorial-card/tutorial-card.component';
import { MainTemplateComponent } from '../../shared/templates/main-template/main-template.component';

@Component({
  selector: 'app-tutorial',
  imports: [TutorialCardComponent, MainTemplateComponent],
  templateUrl: './tutorial.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TutorialComponent {
}
