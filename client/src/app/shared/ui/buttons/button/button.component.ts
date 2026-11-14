import { Component, computed, input, output } from "@angular/core";
import { LucideDynamicIcon } from "@lucide/angular";

export type ButtonVariant =
  | "primary"
  | "ghost"
  | "danger"
  | "warning";
export type ButtonSize = "small" | "medium" | "large";

@Component({
  selector: "app-button",
  standalone: true,
  imports: [LucideDynamicIcon],
  templateUrl: "./button.component.html",
  styleUrl: "./button.component.css",
})
export class ButtonComponent {
  readonly label = input("Submit");
  readonly ariaLabel = input<string | null>(null);
  readonly loadingLabel = input<string | null>(null);
  readonly variant = input<ButtonVariant>("primary");
  readonly size = input<ButtonSize>("medium");
  readonly icon = input<string | null>(null);
  readonly iconPosition = input<"start" | "end">("start");
  readonly loading = input(false);
  readonly disabled = input(false);
  readonly type = input<"submit" | "button">("button");
  readonly clicked = output<void>();

  readonly displayLabel = computed(() => {
    if (this.loading() && this.loadingLabel()) {
      return this.loadingLabel()!;
    }
    return this.label();
  });

  get iconSize(): number {
    switch (this.size()) {
      case "small":
        return 14;
      case "medium":
        return 16;
      case "large":
        return 18;
    }
  }

  onClick() {
    if (!this.loading() && !this.disabled()) {
      this.clicked.emit();
    }
  }
}
