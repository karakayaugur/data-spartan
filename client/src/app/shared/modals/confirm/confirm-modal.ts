import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { DIALOG_DATA, DialogRef } from "@angular/cdk/dialog";
import { Button } from "@shared/ui/buttons/button/button";
import { Modal } from "../modal/modal";
import type { ConfirmModalData } from "./confirm-modal.types";

@Component({
  selector: "app-confirm-modal",
  imports: [Modal, Button],
  host: { class: "confirm-modal" },
  templateUrl: "./confirm-modal.html",
  styleUrl: "./confirm-modal.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmModal {
  readonly data = inject<ConfirmModalData>(DIALOG_DATA);
  private readonly ref = inject<DialogRef<boolean>>(DialogRef);

  close(confirmed: boolean): void {
    this.ref.close(confirmed);
  }
}
