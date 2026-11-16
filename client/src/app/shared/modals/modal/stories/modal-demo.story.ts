import { Component, inject, input } from "@angular/core";
import { DIALOG_DATA } from "@angular/cdk/dialog";
import { Button } from "@shared/shared-ui";
import { Modal, ModalSize } from "../modal";
import { ModalService } from "../../modal-service";

@Component({
  selector: "storybook-modal-content",
  imports: [Modal],
  templateUrl: "./modal-content.html",
})
export class ModalDemoContent {
  readonly data = inject<{ title: string; size: ModalSize }>(DIALOG_DATA);
}

@Component({
  selector: "storybook-modal-demo",
  imports: [Button],
  templateUrl: "./modal-demo.html",
})
export class ModalDemo {
  readonly title = input("Example modal");
  readonly size = input<ModalSize>("medium");
  private readonly modal = inject(ModalService);

  open(): void {
    this.modal.open(ModalDemoContent, {
      data: { title: this.title(), size: this.size() },
      ariaLabel: this.title(),
    });
  }
}
