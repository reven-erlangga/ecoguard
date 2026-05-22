import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

import { ButtonComponent } from '../button/button.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-modal',
  imports: [
    CommonModule,
    ButtonComponent,
    FontAwesomeModule
  ],
  templateUrl: './modal.component.html',
  styles: ``,
  host: {
    '(document:keydown.escape)': 'onEscape()'
  }
})
export class ModalComponent {
  faXmark = faXmark;

  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  @Input() className = '';
  @Input() isFullscreen = false;

  isMounted = false;

  constructor(private el: ElementRef) { }

  ngOnInit() {
    if (this.isOpen && typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }
    // Enable transitions after initial render to prevent flashing
    setTimeout(() => {
      this.isMounted = true;
    }, 50);
  }

  ngOnDestroy() {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'unset';
    }
  }

  ngOnChanges() {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = this.isOpen ? 'hidden' : 'unset';
    }
  }

  onBackdropClick(event: MouseEvent) {
    if (!this.isFullscreen) {
      this.close.emit();
    }
  }

  onContentClick(event: MouseEvent) {
    event.stopPropagation();
  }

  onEscape() {
    if (this.isOpen) {
      this.close.emit();
    }
  }
}
