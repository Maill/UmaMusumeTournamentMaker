
import { Component, computed, forwardRef, input, output, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { SelectOption } from '../../types/components.types';

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BaseSelectComponent),
      multi: true,
    },
  ],
  template: `
    <div class="select-wrapper">
      @if (label()) {
      <label [for]="selectId()" class="select-label">
        {{ label() }}
        @if (required()) {
        <span class="required-asterisk">*</span>
        }
      </label>
      }

      <select
        [id]="selectId()"
        [class]="selectClasses()"
        [disabled]="isDisabled()"
        [required]="required()"
        [value]="value()"
        (change)="onChangeEvent($event)"
        (blur)="onBlur($event)"
        (focus)="onFocus($event)"
      >
        @if (placeholder()) {
        <option value="" disabled>{{ placeholder() }}</option>
        } @for (option of options(); track option.value) {
        <option [value]="option.value" [disabled]="option.disabled || false">
          {{ option.label }}
        </option>
        }
      </select>

      @if (error()) {
      <div class="select-error">
        {{ error() }}
      </div>
      } @if (helpText() && !error()) {
      <div class="select-help">
        {{ helpText() }}
      </div>
      }
    </div>
  `,
  styleUrl: './base-select.component.css',
})
export class BaseSelectComponent<T = any> implements ControlValueAccessor {
  readonly label = input<string>('');
  readonly placeholder = input<string>('');
  readonly options = input<SelectOption<T>[]>([]);
  readonly disabled = input<boolean>(false);
  readonly required = input<boolean>(false);
  readonly error = input<string | null>(null);
  readonly helpText = input<string>('');
  readonly selectId = input<string>(`select-${Math.random().toString(36).substr(2, 9)}`);

  readonly valueChange = output<T>();
  readonly focused = output<Event>();
  readonly blurred = output<Event>();

  readonly value = signal<T | null>(null);
  private disabledByCva = signal(false);
  readonly isDisabled = computed(() => this.disabled() || this.disabledByCva());

  // ControlValueAccessor implementation
  private onChangeCallback = (value: T): void => {};
  private onTouchedCallback = (): void => {};

  writeValue(value: T): void {
    this.value.set(value);
  }

  registerOnChange(fn: (value: T) => void): void {
    this.onChangeCallback = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouchedCallback = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabledByCva.set(isDisabled);
  }

  onChangeEvent(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const selectedValue = target.value as T;
    this.value.set(selectedValue);
    this.onChangeCallback(selectedValue);
    this.valueChange.emit(selectedValue);
  }

  onBlur(event: Event): void {
    this.onTouchedCallback();
    this.blurred.emit(event);
  }

  onFocus(event: Event): void {
    this.focused.emit(event);
  }

  readonly selectClasses = computed(() => {
    const classes = ['form-control', 'form-select'];
    if (this.error()) {
      classes.push('is-invalid');
    }
    if (this.isDisabled()) {
      classes.push('disabled');
    }
    return classes.join(' ');
  });
}
