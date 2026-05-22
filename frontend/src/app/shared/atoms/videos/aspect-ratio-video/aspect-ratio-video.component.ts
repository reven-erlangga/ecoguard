import { Component, input, computed, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-aspect-ratio-video',
  templateUrl: './aspect-ratio-video.component.html'
})
export class AspectRatioVideoComponent {
  src = input<string>('');
  aspectRatio = input<string>('video');
  title = input<string>('Embedded Video');

  private sanitizer = inject(DomSanitizer);

  safeSrc = computed(() => {
    const url = this.src();
    return url ? this.sanitizer.bypassSecurityTrustResourceUrl(url) : null;
  });

  aspectClass = computed(() => {
    const ratio = this.aspectRatio();
    // Wrap custom fractions in brackets for Tailwind arbitrary values if not standard
    if (ratio === 'video' || ratio === 'square' || ratio === 'auto') {
      return `aspect-${ratio}`;
    }
    return `aspect-[${ratio}]`;
  });
}
