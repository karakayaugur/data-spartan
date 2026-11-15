import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { LucideDynamicIcon, LucideX, provideLucideIcons } from "@lucide/angular";

@Component({
  selector: "app-input-feedback",
  host: { class: "input-feedback" },
  imports: [LucideDynamicIcon],
  providers: [provideLucideIcons(LucideX)],
  templateUrl: "./input-feedback.component.html",
  styleUrl: "./input-feedback.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputFeedbackComponent {
  readonly message = input.required<string>();
  readonly feedbackId = input.required<string>();
}
