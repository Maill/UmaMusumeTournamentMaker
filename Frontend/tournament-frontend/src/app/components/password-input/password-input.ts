import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-password-input',
  imports: [FormsModule, CommonModule],
  templateUrl: './password-input.html',
  styleUrl: './password-input.css'
})
export class PasswordInputComponent {
  @Input() isVisible = false;
  @Input() title = 'Enter Tournament Password';
  @Input() message = 'This tournament is password protected. Please enter the password to continue.';
  @Input() isLoading = false;
  @Input() error = '';
  
  @Output() passwordSubmitted = new EventEmitter<string>();
  @Output() cancelled = new EventEmitter<void>();

  password = '';

  onSubmit() {
    if (this.password.trim()) {
      this.passwordSubmitted.emit(this.password.trim());
    }
  }

  onCancel() {
    this.password = '';
    this.cancelled.emit();
  }

  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.onSubmit();
    } else if (event.key === 'Escape') {
      this.onCancel();
    }
  }
}