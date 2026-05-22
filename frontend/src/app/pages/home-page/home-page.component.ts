import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecapMainComponent } from "../../features/recap/main.component";
import { IssueDatatableComponent } from '../../features/issue/datatable/main.component';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    CommonModule,
    RecapMainComponent,
    IssueDatatableComponent
  ],
  templateUrl: './home-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePageComponent {
  protected readonly title = signal('Dashboard');
  protected readonly isModalOpen = signal(false);
}
