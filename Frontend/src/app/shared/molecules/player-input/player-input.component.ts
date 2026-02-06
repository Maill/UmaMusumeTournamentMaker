
import { Component, ElementRef, afterNextRender, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BaseButtonComponent } from '../../atoms/button/base-button.component';
import { BaseInputComponent } from '../../atoms/input/base-input.component';

@Component({
  selector: 'app-player-input',
  standalone: true,
  imports: [FormsModule, BaseInputComponent, BaseButtonComponent],
  template: `
    <div class="player-input-wrapper">
      <div class="input-group">
        <app-input
          #playerNameInput
          [label]="label()"
          type="text"
          [placeholder]="placeholder()"
          [(ngModel)]="playerName"
          [disabled]="disabled() || isLoading()"
          [error]="error()"
          [required]="required()"
          (enterPressed)="onAddPlayer()"
          (valueChange)="onNameChange($event)"
        >
        </app-input>

        <div class="input-group-append">
          <app-button
            variant="primary"
            [disabled]="disabled() || isLoading() || !canAddPlayer()"
            [loading]="isLoading()"
            [loadingText]="loadingText()"
            (clicked)="onAddPlayer()"
          >
            {{ buttonText() }}
          </app-button>
        </div>
      </div>
    </div>
  `,
  styleUrl: './player-input.component.css',
})
export class PlayerInputComponent {
  private el = inject(ElementRef);

  readonly label = input<string>('');
  readonly placeholder = input<string>('Enter player name');
  readonly buttonText = input<string>('Add Player');
  readonly loadingText = input<string>('Adding...');
  readonly disabled = input<boolean>(false);
  readonly isLoading = input<boolean>(false);
  readonly error = input<string | null>(null);
  readonly required = input<boolean>(false);
  readonly minLength = input<number>(1);
  readonly maxLength = input<number>(50);
  readonly autoFocus = input<boolean>(false);
  readonly clearOnAdd = input<boolean>(true);

  readonly playerAdded = output<string>();
  readonly nameChanged = output<string>();

  readonly playerName = signal('');

  constructor() {
    afterNextRender(() => {
      if (this.autoFocus()) {
        this.focusInput();
      }
    });
  }

  onAddPlayer(): void {
    if (this.canAddPlayer()) {
      const trimmedName = this.playerName().trim();
      this.playerAdded.emit(trimmedName);

      if (this.clearOnAdd()) {
        this.playerName.set('');
        this.focusInput();
      }
    }
  }

  onNameChange(name: string): void {
    this.playerName.set(name);
    this.nameChanged.emit(name);
  }

  canAddPlayer(): boolean {
    const trimmedName = this.playerName().trim();
    return (
      trimmedName.length >= this.minLength() &&
      trimmedName.length <= this.maxLength() &&
      !this.disabled() &&
      !this.isLoading()
    );
  }

  focusInput(): void {
    setTimeout(() => {
      const input = this.el.nativeElement.querySelector('input');
      if (input) {
        input.focus();
      }
    }, 0);
  }
}
