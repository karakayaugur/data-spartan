export type NotificationVariant = 'success' | 'error' | 'warning' | 'info';

export interface NotificationOptions {
  title?: string;
  duration?: number;
}

export interface Notification {
  id: number;
  variant: NotificationVariant;
  message: string;
  title?: string;
  duration: number;
}
