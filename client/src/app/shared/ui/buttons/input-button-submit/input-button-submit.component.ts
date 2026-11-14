import { Component, input } from '@angular/core';

export type InputButtonVariant = 'primary' | 'ghost' | 'danger';
export type InputButtonType = 'submit' | 'button';

@Component({
  selector: 'app-input-button-submit',
  standalone: true,
  templateUrl: './input-button-submit.component.html',
  styleUrl: './input-button-submit.component.css',
})
export class InputButtonSubmitComponent {
  readonly label = input('Submit');
  readonly loading = input(false);
  readonly disabled = input(false);
  readonly variant = input<InputButtonVariant>('primary');
  readonly type = input<InputButtonType>('submit');
}
