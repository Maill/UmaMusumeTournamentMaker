
import { Component, computed, forwardRef, input, output, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { InputType } from '../../types/ui.types';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BaseInputComponent),
      multi: true,
    },
  ],
  template: `
    @if (label()) {
    <label [for]="inputId()" class="input-label">
      {{ label() }}
      @if (required()) {
      <span class="required-asterisk">*</span>
      }
    </label>
    }

    <input
      [id]="inputId()"
      [type]="type()"
      [class]="inputClasses()"
      [placeholder]="placeholder()"
      [disabled]="isDisabled()"
      [readonly]="isReadonly()"
      [required]="required()"
      [value]="value()"
      (input)="onInput($event)"
      (blur)="onBlur($event)"
      (focus)="onFocus($event)"
      (keyup.enter)="onEnterPress($event)"
      (keyup.escape)="onEscapePress($event)"
      #inputElement
    />

    @if (error()) {
    <div class="input-error">
      {{ error() }}
    </div>
    } @if (helpText() && !error()) {
    <div class="input-help">
      {{ helpText() }}
    </div>
    }
  `,
  styleUrl: './base-input.component.css',
})
export class BaseInputComponent implements ControlValueAccessor {
  readonly type = input<InputType>('text');
  readonly label = input<string>('');
  readonly placeholder = input<string>('');
  readonly disabled = input<boolean>(false);
  readonly isReadonly = input<boolean>(false, { alias: 'readonly' });
  readonly required = input<boolean>(false);
  readonly error = input<string | null>(null);
  readonly helpText = input<string>('');
  readonly inputId = input<string>(`input-${Math.random().toString(36).substr(2, 9)}`);

  readonly valueChange = output<string>();
  readonly enterPressed = output<Event>();
  readonly escapePressed = output<Event>();
  readonly focused = output<Event>();
  readonly blurred = output<Event>();

  readonly value = signal<string>('');
  private disabledByCva = signal(false);
  readonly isDisabled = computed(() => this.disabled() || this.disabledByCva());

  // ControlValueAccessor implementation
  private onChange = (value: string): void => {};
  private onTouched = (): void => {};

  writeValue(value: string): void {
    this.value.set(value || '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabledByCva.set(isDisabled);
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value.set(target.value);
    this.onChange(this.value());
    this.valueChange.emit(this.value());
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

  inputClasses(): string {
    const classes = ['form-control'];
    if (this.error()) {
      classes.push('is-invalid');
    }
    if (this.isDisabled()) {
      classes.push('disabled');
    }
    if (this.isReadonly()) {
      classes.push('readonly');
    }
    return classes.join(' ');
  }
}
