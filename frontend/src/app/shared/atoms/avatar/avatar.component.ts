import { Component, input, computed } from '@angular/core';

type AvatarSize = 'xsmall' | 'small' | 'medium' | 'large' | 'xlarge' | 'xxlarge';
type AvatarStatus = 'online' | 'offline' | 'busy' | 'none';

@Component({
  selector: 'app-avatar',
  template: `
    <div
      class="relative flex shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600 font-medium"
      [class]="sizeClass()"
    >
      <!-- Avatar Image / Fallback -->
      @if (src()) {
        <img
          [src]="src()"
          [alt]="alt()"
          class="h-full w-full object-cover rounded-full"
        />
      } @else {
        <span [class]="textClass()">{{ initials() }}</span>
      }

      <!-- Status Indicator -->
      @if (status() !== 'none') {
        <span
          class="absolute bottom-0 right-0 rounded-full border-[1.5px] border-white"
          [class]="statusClass()"
        ></span>
      }
    </div>
  `
})
export class AvatarComponent {
  src = input<string>('');
  alt = input<string>('User Avatar');
  size = input<AvatarSize>('medium');
  status = input<AvatarStatus>('none');

  initials = computed(() => {
    const name = this.alt().trim();
    if (!name || name.toLowerCase() === 'user avatar') return '';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  });

  sizeClass = computed(() => {
    const sizes: Record<AvatarSize, string> = {
      xsmall: 'h-6 w-6',
      small: 'h-8 w-8',
      medium: 'h-10 w-10',
      large: 'h-12 w-12',
      xlarge: 'h-14 w-14',
      xxlarge: 'h-16 w-16',
    };
    return sizes[this.size()];
  });

  textClass = computed(() => {
    const sizes: Record<AvatarSize, string> = {
      xsmall: 'text-[10px]',
      small: 'text-xs',
      medium: 'text-sm',
      large: 'text-base',
      xlarge: 'text-lg',
      xxlarge: 'text-xl',
    };
    return sizes[this.size()];
  });

  statusClass = computed(() => {
    const statusSizes: Record<AvatarSize, string> = {
      xsmall: 'h-1.5 w-1.5',
      small: 'h-2 w-2',
      medium: 'h-2.5 w-2.5',
      large: 'h-3 w-3',
      xlarge: 'h-3.5 w-3.5',
      xxlarge: 'h-4 w-4',
    };
    
    const statusColors: Record<Exclude<AvatarStatus, 'none'>, string> = {
      online: 'bg-green-500',
      offline: 'bg-gray-400',
      busy: 'bg-red-500',
    };

    const s = this.status();
    const color = s !== 'none' ? statusColors[s] : '';
    return `${statusSizes[this.size()]} ${color}`;
  });
}
