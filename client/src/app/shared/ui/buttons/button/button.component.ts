import { A11yModule } from "@angular/cdk/a11y";
import { Component, computed, input, output } from "@angular/core";
import { LucideDynamicIcon } from "@lucide/angular";

export type ButtonVariant =
  | "ghost"
  | "neutral"
  | "primary"
  | "danger"
  | "warning"
  | "primary-outline"
  | "danger-outline"
  | "warning-outline";
export type ButtonSize = "small" | "medium" | "large";

@Component({
  selector: "app-button",
  host: { class: "button" },
  imports: [LucideDynamicIcon, A11yModule],
  templateUrl: "./button.component.html",
  styleUrl: "./button.component.scss",
})
export class ButtonComponent {
  readonly label = input("Submit");
  readonly ariaControls = input<string | null>(null);
  readonly ariaExpanded = input<boolean | null>(null);
  readonly ariaHasPopup = input<"dialog" | "menu" | null>(null);
  readonly ariaLabel = input<string | null>(null);
  readonly loadingLabel = input<string | null>(null);
  readonly variant = input<ButtonVariant>("primary");
  readonly size = input<ButtonSize>("medium");
  readonly icon = input<string | null>(null);
  readonly iconOnly = input(false);
  readonly focusInitial = input(false);
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
        return 10;
      case "medium":
        return 12;
      case "large":
        return 14;
    }
  }

  onClick() {
    if (!this.loading() && !this.disabled()) {
      this.clicked.emit();
    }
  }
}
