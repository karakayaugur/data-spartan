import { Component, inject, input, computed } from "@angular/core";
import { AlertService } from "@core/services/alert.service";
import { LucideDynamicIcon } from "@lucide/angular";

@Component({
  selector: "app-alert",
  standalone: true,
  imports: [LucideDynamicIcon],
  templateUrl: "./alert.component.html",
  styleUrl: "./alert.component.css",
  host: {
    "[class.has-notices]": "inlineNotices().length > 0",
    "[class.is-popup-root]": "isRootContainer()",
  },
})
export class AlertComponent {
  alertService = inject(AlertService);

  isRootContainer = input<boolean>(false);
  /** When set, only inline notices with this scope are shown. */
  scope = input<string | null>(null);

  popupNotices = computed(() =>
    this.alertService.notices().filter((n) => n.isPopup === true),
  );
  inlineNotices = computed(() => {
    const hostScope = this.scope();
    if (!hostScope) return [];
    return this.alertService
      .notices()
      .filter((n) => !n.isPopup && n.scope === hostScope);
  });

  getIcon(type: string): string {
    switch (type) {
      case "success":
        return "circle-check";
      case "warning":
        return "circle-alert";
      case "error":
        return "circle-x";
      default:
        return "info";
    }
  }

  truncateMessage(msg: string): string {
    const text = (msg ?? "").trim();
    if (!text) return "Something went wrong. Please try again.";
    const limit = 180;
    return text.length > limit ? text.substring(0, limit) + "…" : text;
  }
}
