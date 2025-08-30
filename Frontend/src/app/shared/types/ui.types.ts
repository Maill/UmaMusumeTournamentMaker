export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'danger'
  | 'success'
  | 'outline-primary'
  | 'outline-secondary'
  | 'outline-danger';

export type ButtonSize = 'sm' | 'md' | 'lg';

export type ButtonType = 'button' | 'submit' | 'reset';

export type InputType = 'text' | 'password' | 'email' | 'number';

export type BadgeVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'danger'
  | 'warning'
  | 'info'
  | 'light'
  | 'dark'
  | 'bronze'
  | 'silver';

export type LoadingSize = 'sm' | 'md' | 'lg';

export interface ButtonConfig {
  variant: ButtonVariant;
  size: ButtonSize;
  type: ButtonType;
  disabled: boolean;
  loading: boolean;
  loadingText: string;
  fullWidth: boolean;
}

export interface InputConfig {
  type: InputType;
  placeholder: string;
  disabled: boolean;
  required: boolean;
  readonly: boolean;
}

export interface BadgeConfig {
  variant: BadgeVariant;
  text: string;
  dismissible: boolean;
}
