import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotFoundHeadingComponent } from './components/heading/heading.component';
import { NotFoundTerminalComponent } from './components/terminal/terminal.component';
import { NotFoundBackButtonComponent } from './components/back-button/back-button.component';

@Component({
  selector: 'app-not-found-main',
  standalone: true,
  imports: [
    CommonModule,
    NotFoundHeadingComponent,
    NotFoundTerminalComponent,
    NotFoundBackButtonComponent
  ],
  templateUrl: './main.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFoundMainComponent {
}
