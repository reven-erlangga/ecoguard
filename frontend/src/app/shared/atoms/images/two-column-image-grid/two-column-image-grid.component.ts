import { Component, input } from '@angular/core';

@Component({
  selector: 'app-two-column-image-grid',
  templateUrl: './two-column-image-grid.component.html'
})
export class TwoColumnImageGridComponent {
  images = input<{src: string, alt?: string}[]>([
    { src: 'https://placehold.co/600x400/png', alt: 'Image 1' },
    { src: 'https://placehold.co/600x400/png', alt: 'Image 2' }
  ]);
}
