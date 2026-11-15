import { ChangeDetectionStrategy, Component, inject, input } from "@angular/core";
import { DialogRef } from "@angular/cdk/dialog";
import { ButtonComponent } from "@shared/ui/buttons/button/button.component";

export type ModalSize = "small" | "medium" | "large" | "full";

@Component({
  selector: "app-modal",
  host: { class: "modal" },
  imports: [ButtonComponent],
  templateUrl: "./modal.component.html",
  styleUrl: "./modal.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalComponent {
  readonly title = input.required<string>();
  readonly size = input<ModalSize>("medium");
  private readonly ref = inject(DialogRef);

  close(): void {
    this.ref.close();
  }
}
