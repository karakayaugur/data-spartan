import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { DIALOG_DATA, DialogRef } from "@angular/cdk/dialog";
import { ButtonComponent } from "@shared/ui/buttons/button/button.component";
import { ModalComponent } from "../modal/modal.component";
import type { ConfirmModalData } from "./confirm-modal.types";

@Component({
  selector: "app-confirm-modal",
  imports: [ModalComponent, ButtonComponent],
  host: { class: "confirm-modal" },
  templateUrl: "./confirm-modal.component.html",
  styleUrl: "./confirm-modal.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmModalComponent {
  readonly data = inject<ConfirmModalData>(DIALOG_DATA);
  private readonly ref = inject<DialogRef<boolean>>(DialogRef);

  close(confirmed: boolean): void {
    this.ref.close(confirmed);
  }
}
