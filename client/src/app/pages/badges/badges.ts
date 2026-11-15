import { ChangeDetectionStrategy, Component } from "@angular/core";
import { LucideArrowUpRight, LucideCheck, provideLucideIcons } from "@lucide/angular";
import { BadgeComponent, BadgeVariant } from "@shared/shared-ui";

@Component({
  selector: "app-badges",
  host: { class: "badges" },
  imports: [BadgeComponent],
  providers: [provideLucideIcons(LucideCheck, LucideArrowUpRight)],
  templateUrl: "./badges.html",
  styleUrl: "./badges.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Badges {
  readonly variants: BadgeVariant[] = [
    "default",
    "success",
    "error",
    "info",
    "primary",
    "danger",
    "warning",
    "primary-outline",
    "danger-outline",
    "warning-outline",
  ];
}
