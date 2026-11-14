import { Injectable, signal } from "@angular/core";

export interface Notice {
  id?: string;
  message: string;
  type: "success" | "warning" | "error" | "info" | string;
  isPopup?: boolean;
  /** When set with isPopup=false, only `<app-alert [scope]="…">` hosts render this notice. */
  scope?: string;
}
export interface InternalNotice extends Notice {
  id: string;
  isClosing?: boolean;
}
@Injectable({
  providedIn: "root",
})
export class AlertService {
  notices = signal<InternalNotice[]>([]);

  /**
   * Popup notices auto-dismiss after `duration` (default 3000ms).
   * Inline (scoped) notices are sticky unless an explicit duration is passed.
   */
  setNotice(notice: Notice, duration?: number) {
    const id = notice.id ?? Math.random().toString(36).substring(2, 9);

    const newNotice: InternalNotice = { ...notice, id, isClosing: false };

    this.notices.update((list) => [...list, newNotice]);

    const isPopup = notice.isPopup === true;
    const autoCloseMs = duration ?? (isPopup ? 3000 : undefined);
    if (autoCloseMs != null && autoCloseMs > 0) {
      setTimeout(() => {
        this.close(id);
      }, autoCloseMs);
    }
  }

  clearScope(scope: string): void {
    const ids = this.notices()
      .filter((n) => n.scope === scope && !n.isPopup)
      .map((n) => n.id);
    for (const id of ids) {
      this.close(id);
    }
  }

  close(id: string) {
    this.notices.update((list) =>
      list.map((n) => (n.id === id ? { ...n, isClosing: true } : n)),
    );
    setTimeout(() => {
      this.notices.update((list) => list.filter((n) => n.id !== id));
    }, 200);
  }
}
