import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsMainComponent } from '../../features/analytics/main.component';
import { MainTemplateComponent } from '../../shared/templates/main-template/main-template.component';

@Component({
  selector: 'app-monitoring',
  standalone: true,
  imports: [
    CommonModule,
    MainTemplateComponent,
    AnalyticsMainComponent,
  ],
  templateUrl: './monitoring.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MonitoringComponent { }
