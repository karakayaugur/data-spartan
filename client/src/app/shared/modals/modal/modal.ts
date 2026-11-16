import { ChangeDetectionStrategy, Component, inject, input } from "@angular/core";
import { DialogRef } from "@angular/cdk/dialog";
import { Button } from "@shared/ui/buttons/button/button";

export type ModalSize = "small" | "medium" | "large" | "full";

@Component({
  selector: "app-modal",
  host: { class: "modal" },
  imports: [Button],
  templateUrl: "./modal.html",
  styleUrl: "./modal.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Modal {
  readonly title = input.required<string>();
  readonly size = input<ModalSize>("medium");
  private readonly ref = inject(DialogRef);

  close(): void {
    this.ref.close();
  }
}
