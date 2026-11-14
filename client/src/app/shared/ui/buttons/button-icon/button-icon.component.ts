import { Component, input, output } from "@angular/core";
import { LucideDynamicIcon } from "@lucide/angular";

export type ButtonIconSize = "small" | "medium" | "large";

@Component({
  selector: "app-button-icon",
  standalone: true,
  imports: [LucideDynamicIcon],
  templateUrl: "./button-icon.component.html",
  styleUrls: ["./button-icon.component.css"],
})
export class ButtonIconComponent {
  readonly icon = input.required<string>();
  readonly ariaLabel = input.required<string>();
  readonly size = input<ButtonIconSize>("medium");
  readonly loading = input(false);
  readonly disabled = input(false);
  readonly type = input<"submit" | "button">("button");
  readonly clicked = output<void>();

  get iconSize(): number {
    switch (this.size()) {
      case "small":
        return 16;
      case "medium":
        return 20;
      case "large":
        return 24;
    }
  }

  onClick() {
    if (!this.loading() && !this.disabled()) {
      this.clicked.emit();
    }
  }
}
