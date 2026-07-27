import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatInputModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  username = '';
  password = '';
  isLoading = false;
  errorMsg = '';
  showPassword = false;

  constructor(private auth: AuthService, private router: Router, private cdr: ChangeDetectorRef) {
    if (this.auth.isLoggedIn()) this.router.navigate(['/']);
  }

  async login() {
    if (!this.username.trim() || !this.password.trim()) {
      this.errorMsg = 'Please enter username and password';
      return;
    }
    this.isLoading = true;
    this.errorMsg = '';
    this.cdr.markForCheck();
    try {
      await this.auth.login(this.username.trim(), this.password);
      this.router.navigate(['/']);
    } catch (err: any) {
      this.errorMsg = err?.error?.error || 'Invalid credentials. Please try again.';
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }
}
