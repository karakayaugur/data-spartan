import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { LucideDynamicIcon, LucideX, provideLucideIcons } from "@lucide/angular";

@Component({
  selector: "app-input-feedback",
  host: { class: "input-feedback" },
  imports: [LucideDynamicIcon],
  providers: [provideLucideIcons(LucideX)],
  templateUrl: "./input-feedback.html",
  styleUrl: "./input-feedback.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputFeedback {
  readonly message = input.required<string>();
  readonly feedbackId = input.required<string>();
}
