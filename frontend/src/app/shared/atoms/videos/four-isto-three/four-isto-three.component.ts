import { Component, input, computed, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-four-isto-three',
  templateUrl: './four-isto-three.component.html'
})
export class FourIstoThreeComponent {
  src = input<string>('https://www.youtube.com/embed/dQw4w9WgXcQ');
  title = input<string>('YouTube video');
  private sanitizer = inject(DomSanitizer);
  safeSrc = computed(() => this.src() ? this.sanitizer.bypassSecurityTrustResourceUrl(this.src()) : null);
}
