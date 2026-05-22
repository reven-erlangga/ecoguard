import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoginFacade } from '../../features/auth/login/facades/login.facade';
import { AuthTemplateComponent } from '../../shared/templates/auth-template/auth-template.component';
import { InputComponent } from '../../shared/atoms/input/input.component';
import { ButtonComponent } from '../../shared/atoms/button/button.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AuthTemplateComponent,
    InputComponent,
    ButtonComponent
  ],
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
  facade = inject(LoginFacade);
  
  email = signal<string>('');
  password = signal<string>('');

  get isFormValid(): boolean {
    return this.email().includes('@') && this.password().length >= 6;
  }

  onSubmit(event: Event) {
    event.preventDefault();
    if (this.isFormValid) {
      this.facade.login({
        email: this.email().trim(),
        password: this.password()
      });
    }
  }
}
