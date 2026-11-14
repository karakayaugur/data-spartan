import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import {
  LucideArrowRight,
  LucideCheck,
  LucideLoaderCircle,
  LucidePlus,
  LucideX,
  provideLucideIcons,
} from "@lucide/angular";
import {
  ButtonComponent,
  ButtonSize,
  ButtonVariant,
} from "@shared/ui/buttons/button/button.component";

@Component({
  selector: "app-buttons",
  imports: [ButtonComponent],
  providers: [
    provideLucideIcons(LucideArrowRight, LucideCheck, LucideLoaderCircle, LucidePlus, LucideX),
  ],
  templateUrl: "./buttons.html",
  styleUrl: "./buttons.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Buttons {
  readonly variants: ButtonVariant[] = [
    "ghost",
    "neutral",
    "primary",
    "danger",
    "warning",
    "primary-outline",
    "danger-outline",
    "warning-outline",
  ];
  readonly sizes: ButtonSize[] = ["small", "medium", "large"];
  readonly lastAction = signal("Click any enabled button to try it.");

  record(label: string): void {
    this.lastAction.set(`${label} clicked.`);
  }
}
