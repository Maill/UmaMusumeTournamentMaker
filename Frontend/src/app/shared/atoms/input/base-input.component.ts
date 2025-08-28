import { CommonModule } from '@angular/common';
import { Component, EventEmitter, forwardRef, Input, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { InputType } from '../../types/ui.types';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BaseInputComponent),
      multi: true,
    },
  ],
  template: `
    @if (label) {
    <label [for]="inputId" class="input-label">
      {{ label }}
      @if (required) {
      <span class="required-asterisk">*</span>
      }
    </label>
    }

    <input
      [id]="inputId"
      [type]="type"
      [class]="getInputClasses()"
      [placeholder]="placeholder"
      [disabled]="disabled"
      [readonly]="readonly"
      [required]="required"
      [value]="value"
      (input)="onInput($event)"
      (blur)="onBlur($event)"
      (focus)="onFocus($event)"
      (keyup.enter)="onEnterPress($event)"
      (keyup.escape)="onEscapePress($event)"
      #inputElement
    />

    @if (error) {
    <div class="input-error">
      {{ error }}
    </div>
    } @if (helpText && !error) {
    <div class="input-help">
      {{ helpText }}
    </div>
    }
  `,
  styleUrl: './base-input.component.css',
})
export class BaseInputComponent implements ControlValueAccessor {
  @Input() type: InputType = 'text';
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() disabled: boolean = false;
  @Input() readonly: boolean = false;
  @Input() required: boolean = false;
  @Input() error: string | null = null;
  @Input() helpText: string = '';
  @Input() inputId: string = `input-${Math.random().toString(36).substr(2, 9)}`;

  @Output() valueChange = new EventEmitter<string>();
  @Output() enterPressed = new EventEmitter<Event>();
  @Output() escapePressed = new EventEmitter<Event>();
  @Output() focused = new EventEmitter<Event>();
  @Output() blurred = new EventEmitter<Event>();

  value: string = '';

  // ControlValueAccessor implementation
  private onChange = (value: string): void => {};
  private onTouched = (): void => {};

  writeValue(value: string): void {
    this.value = value || '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.onChange(this.value);
    this.valueChange.emit(this.value);
  }

  onBlur(event: Event): void {
    this.onTouched();
    this.blurred.emit(event);
  }

  onFocus(event: Event): void {
    this.focused.emit(event);
  }

  onEnterPress(event: Event): void {
    this.enterPressed.emit(event);
  }

  onEscapePress(event: Event): void {
    this.escapePressed.emit(event);
  }

  getInputClasses(): string {
    const classes = ['form-control'];

    if (this.error) {
      classes.push('is-invalid');
    }

    if (this.disabled) {
      classes.push('disabled');
    }

    if (this.readonly) {
      classes.push('readonly');
    }

    return classes.join(' ');
  }
}
