import { ButtonComponent } from "@shared/shared-ui";
import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { LucideCircleAlert, LucideCircleCheck, LucideCircleX, LucideDynamicIcon, LucideInfo, LucideX, provideLucideIcons } from "@lucide/angular";
import { NotificationService } from "../notification.service";
import { NotificationVariant } from "../notification.model";

@Component({
  selector: "app-toast-container",
  imports: [LucideDynamicIcon, ButtonComponent],
  providers: [provideLucideIcons(LucideCircleAlert, LucideCircleCheck, LucideCircleX, LucideInfo, LucideX)],
  templateUrl: "./toast-container.component.html",
  styleUrl: "./toast-container.component.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastContainer {
  readonly service = inject(NotificationService);
  readonly icons: Record<NotificationVariant, string> = {
    success: "circle-check", error: "circle-x", warning: "circle-alert", info: "info",
  };
}
