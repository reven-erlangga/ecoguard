import { CommonModule } from '@angular/common';
import { Component, Input, ChangeDetectionStrategy, signal } from '@angular/core';
import { SafeHtmlPipe } from '../../pipe/safe-html.pipe';

type BadgeVariant = 'light' | 'solid';
type BadgeSize = 'sm' | 'md';
type BadgeColor = 'primary' | 'success' | 'error' | 'warning' | 'info' | 'light' | 'dark';

@Component({
  selector: 'app-badge',
  imports: [CommonModule, SafeHtmlPipe],
  templateUrl: './badge.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': '"inline-block"'
  }
})
export class BadgeComponent {
  @Input() variant: BadgeVariant = 'light';
  @Input() size: BadgeSize = 'md';
  @Input() color: BadgeColor = 'primary';
  @Input() startIcon?: string; // SVG or HTML string
  @Input() endIcon?: string;   // SVG or HTML string

  isHovered = signal(false);

  get baseStyles() {
    return 'inline-flex items-center justify-center font-mono font-black uppercase tracking-wider rounded-none transition-all duration-200 ease-out cursor-default select-none';
  }

  get sizeClass() {
    return {
      sm: 'text-[9px] px-2 py-0.5 border-2',
      md: 'text-[11px] px-3 py-1 border-2',
    }[this.size];
  }

  get colorStyles() {
    const variants = {
      light: {
        primary: 'border-indigo-600 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 hover:text-indigo-900',
        success: 'border-emerald-600 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-900',
        error: 'border-rose-600 text-rose-700 bg-rose-50 hover:bg-rose-100 hover:text-rose-900',
        warning: 'border-amber-600 text-amber-700 bg-amber-50 hover:bg-amber-100 hover:text-amber-900',
        info: 'border-sky-600 text-sky-700 bg-sky-50 hover:bg-sky-100 hover:text-sky-900',
        light: 'border-gray-400 text-gray-600 bg-gray-50 hover:bg-gray-100 hover:text-gray-900',
        dark: 'border-black text-white bg-black hover:bg-gray-900',
      },
      solid: {
        primary: 'border-2 border-black bg-indigo-400 text-black shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] hover:bg-indigo-300',
        success: 'border-2 border-black bg-emerald-400 text-black shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] hover:bg-emerald-300',
        error: 'border-2 border-black bg-rose-400 text-black shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] hover:bg-rose-300',
        warning: 'border-2 border-black bg-amber-400 text-black shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] hover:bg-amber-300',
        info: 'border-2 border-black bg-sky-400 text-black shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] hover:bg-sky-300',
        light: 'border-2 border-black bg-gray-200 text-gray-800 shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100',
        dark: 'border-2 border-black bg-black text-white shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-800',
      },
    };
    return variants[this.variant][this.color];
  }

  // Deterministic angle based on inputs
  private getDeterministicAngle(): number {
    const str = `${this.color}-${this.variant}-${this.size}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const angles = [-2.0, 2.0, -1.5, 1.5, -1.0, 1.0, -0.5, 0.5, -2.5, 2.5];
    const index = Math.abs(hash) % angles.length;
    return angles[index];
  }

  get transformStyle(): string {
    const angle = this.getDeterministicAngle();
    if (this.isHovered()) {
      // Amplify rotation on hover and scale up slightly
      const hoverAngle = angle * 2.5;
      return `rotate(${hoverAngle}deg) scale(1.05)`;
    }
    return `rotate(${angle}deg)`;
  }
}