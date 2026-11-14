import { ChangeDetectionStrategy, Component, computed, input } from "@angular/core";
import { LucideBot, LucideDynamicIcon, LucideUser, provideLucideIcons } from "@lucide/angular";

export type AvatarBadgeType = "robot" | "organic";

@Component({
  selector: "app-avatar-badge",
  imports: [LucideDynamicIcon],
  providers: [provideLucideIcons(LucideBot, LucideUser)],
  templateUrl: "./avatar-badge.component.html",
  styleUrl: "./avatar-badge.component.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { "[class.avatar-robot]": 'type() === "robot"' },
})
export class AvatarBadgeComponent {
  readonly type = input.required<AvatarBadgeType>();
  readonly icon = computed(() => (this.type() === "robot" ? "bot" : "user"));
  readonly label = computed(() =>
    this.type() === "robot" ? "Artificial being · Droid" : "Organic character",
  );
}
