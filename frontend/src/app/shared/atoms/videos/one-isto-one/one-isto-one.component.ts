import { Component, input, computed, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-one-isto-one',
  templateUrl: './one-isto-one.component.html'
})
export class OneIstoOneComponent {
  src = input<string>('https://www.youtube.com/embed/dQw4w9WgXcQ');
  title = input<string>('YouTube video');
  private sanitizer = inject(DomSanitizer);
  safeSrc = computed(() => this.src() ? this.sanitizer.bypassSecurityTrustResourceUrl(this.src()) : null);
}
