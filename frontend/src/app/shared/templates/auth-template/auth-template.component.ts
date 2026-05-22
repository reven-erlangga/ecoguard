import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../../molecules/card/card.component';
import { HeaderComponent } from '../../molecules/header/header.component';

@Component({
  selector: 'app-auth-template',
  standalone: true,
  imports: [CommonModule, CardComponent, HeaderComponent],
  templateUrl: './auth-template.component.html',
  styles: [`
    @keyframes float1 {
      0%, 100% { transform: translateY(0) rotate(12deg); }
      50% { transform: translateY(-20px) rotate(16deg); }
    }
    @keyframes float2 {
      0%, 100% { transform: translateY(0) rotate(-12deg); }
      50% { transform: translateY(20px) rotate(-8deg); }
    }
    @keyframes float3 {
      0%, 100% { transform: translateY(0) rotate(45deg); }
      50% { transform: translateY(-15px) rotate(50deg); }
    }
    @keyframes float4 {
      0%, 100% { transform: translate(0, 0); }
      50% { transform: translate(15px, 15px); }
    }
    @keyframes slideRight {
      0% { transform: translateX(0); }
      100% { transform: translateX(80px); }
    }
    @keyframes slideLeft {
      0% { transform: translateX(0); }
      100% { transform: translateX(-80px); }
    }

    .animate-slide-right { animation: slideRight 6s linear infinite; }
    .animate-slide-left { animation: slideLeft 6s linear infinite; }

    .animate-float-1 { animation: float1 4s ease-in-out infinite; }
    .animate-float-2 { animation: float2 5s ease-in-out infinite; }
    .animate-float-3 { animation: float3 6s ease-in-out infinite; }
    .animate-float-4 { animation: float4 4.5s ease-in-out infinite; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthTemplateComponent {
  title = input.required<string>();
  subtitle = input<string>('');
  headerTitle = input.required<string>();
  headerSubtitle = input.required<string>();
}
