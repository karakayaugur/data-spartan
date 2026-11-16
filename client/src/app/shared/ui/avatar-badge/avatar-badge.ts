import { ChangeDetectionStrategy, Component, computed, input } from "@angular/core";
import { LucideBot, LucideDynamicIcon, LucideUser, provideLucideIcons } from "@lucide/angular";

export type AvatarBadgeType = "robot" | "organic";

@Component({
  selector: "app-avatar-badge",
  imports: [LucideDynamicIcon],
  providers: [provideLucideIcons(LucideBot, LucideUser)],
  templateUrl: "./avatar-badge.html",
  styleUrl: "./avatar-badge.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "avatar-badge",
    "[class.avatar-badge--robot]": 'type() === "robot"',
  },
})
export class AvatarBadge {
  readonly type = input.required<AvatarBadgeType>();
  readonly label = input<string>();
  readonly icon = computed(() => (this.type() === "robot" ? "bot" : "user"));
}
