import { Component, input } from '@angular/core';

@Component({
  selector: 'app-three-column-image-grid',
  templateUrl: './three-column-image-grid.component.html'
})
export class ThreeColumnImageGridComponent {
  images = input<{src: string, alt?: string}[]>([
    { src: 'https://placehold.co/600x400/png', alt: 'Image 1' },
    { src: 'https://placehold.co/600x400/png', alt: 'Image 2' },
    { src: 'https://placehold.co/600x400/png', alt: 'Image 3' }
  ]);
}
