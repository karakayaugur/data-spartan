import { Injectable, OnDestroy, signal } from "@angular/core";
import { Notification, NotificationOptions, NotificationVariant } from "./notification.model";

@Injectable({ providedIn: "root" })
export class NotificationService implements OnDestroy {
  private readonly items = signal<Notification[]>([]);
  private readonly timers = new Map<number, ReturnType<typeof setTimeout>>();
  private nextId = 0;
  readonly notifications = this.items.asReadonly();

  success(message: string, options?: NotificationOptions): void {
    this.show("success", message, options);
  }
  error(message: string, options?: NotificationOptions): void {
    this.show("error", message, { duration: 7000, ...options });
  }
  warning(message: string, options?: NotificationOptions): void {
    this.show("warning", message, options);
  }
  info(message: string, options?: NotificationOptions): void {
    this.show("info", message, options);
  }

  dismiss(id: number): void {
    const timer = this.timers.get(id);
    if (timer !== undefined) clearTimeout(timer);
    this.timers.delete(id);
    this.items.update((items) => items.filter((item) => item.id !== id));
  }

  ngOnDestroy(): void {
    this.timers.forEach((timer) => clearTimeout(timer));
    this.timers.clear();
  }

  private show(variant: NotificationVariant, message: string, options?: NotificationOptions): void {
    const id = this.nextId++;
    const duration = options?.duration ?? 5000;
    this.items.update((items) => [
      ...items,
      { id, variant, message, title: options?.title, duration },
    ]);
    if (duration > 0)
      this.timers.set(
        id,
        setTimeout(() => this.dismiss(id), duration),
      );
  }
}
