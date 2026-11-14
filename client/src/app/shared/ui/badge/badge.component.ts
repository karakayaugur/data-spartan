import { ChangeDetectionStrategy, Component, computed, input } from "@angular/core";
import { LucideDynamicIcon } from "@lucide/angular";

export type BadgeVariant =
  | "default"
  | "success"
  | "error"
  | "info"
  | "primary"
  | "danger"
  | "warning"
  | "primary-outline"
  | "danger-outline"
  | "warning-outline";

@Component({
  selector: "app-badge",
  imports: [LucideDynamicIcon],
  templateUrl: "./badge.component.html",
  styleUrl: "./badge.component.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BadgeComponent {
  readonly label = input('');
  readonly type = input<"label" | "number">("label");
  readonly value = input(0);
  readonly displayValue = computed(() => this.type() === "number"
    ? this.value() > 9 ? "9+" : String(this.value())
    : this.label());
  readonly variant = input<BadgeVariant>("primary");
  readonly dot = input(false);
  readonly probability = input<"low" | "mid" | "high" | null>(null);
  readonly icon = input<string | null>(null);
}
