import { Component, input } from '@angular/core';

@Component({
  selector: 'app-responsive-image',
  templateUrl: './responsive-image.component.html'
})
export class ResponsiveImageComponent {
  src = input<string>('https://placehold.co/800x400/png');
  alt = input<string>('Responsive image');
}
