import { ChangeDetectionStrategy, Component, input, model, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faUpload } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './upload.component.html',
  styles: [`
    :host { display: block; width: 100%; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UploadComponent {
  accept = input<string>('image/*');
  placeholder = input<string>('SELECT FILE OR DRAG & DROP PHOTO EVIDENCES');
  value = model<File | null>(null);
  className = input<string>('');

  faUpload = faUpload;

  containerClasses = computed(() => {
    const base = 'relative border-4 border-dashed border-black p-4 bg-gray-50 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-100 transition-all duration-200';
    return `${base} ${this.className()}`.trim();
  });

  onFileSelected(event: Event) {
    const inputEl = event.target as HTMLInputElement;
    if (inputEl.files && inputEl.files.length > 0) {
      this.value.set(inputEl.files[0]);
    } else {
      this.value.set(null);
    }
  }
}
