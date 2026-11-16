import flatpickr from "flatpickr";
import { DatePipe, NgTemplateOutlet } from "@angular/common";
import { Modal } from "../modal/modal";
import { InputPicker } from "@shared/shared-ui";
import {
  afterNextRender,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  Injector,
  signal,
  viewChildren,
} from "@angular/core";
import { DIALOG_DATA } from "@angular/cdk/dialog";
import { LucideCalendar } from "@lucide/angular";
import { Film } from "@core/http";
import { FilmFacade } from "@core/store";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ModalService } from "../modal-service";
import { ConfirmModal } from "../confirm/confirm-modal";
import type { ConfirmModalData } from "../confirm/confirm-modal.types";

import { Button } from "@shared/ui/buttons/button/button";
import { VALIDATABLE } from "@shared/models/validatable.model";
import { InputTextarea } from "@shared/ui/inputs/input-textarea/input-textarea";
import { NotificationService } from "@shared/notifications";

const initialFormState = {
  date: "",
  time: "",
  description: "",
};

@Component({
  selector: "app-viewing-log",
  host: { class: "viewing-log" },
  imports: [DatePipe, Modal, InputPicker, InputTextarea, Button, NgTemplateOutlet, LucideCalendar],
  templateUrl: "./viewing-log.html",
  styleUrl: "./viewing-log.scss",
})
export class ViewingLog {
  readonly today = flatpickr.formatDate(new Date(), "Y-m-d");
  readonly film = inject<Film>(DIALOG_DATA);
  private readonly filmFacade = inject(FilmFacade);
  private readonly notifications = inject(NotificationService);
  private readonly validatables = viewChildren(VALIDATABLE);
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);
  private readonly modal = inject(ModalService);
  private readonly destroyRef = inject(DestroyRef);
  private confirming = false;
  readonly viewings = computed(() => this.filmFacade.getViewings(this.film.episodeId));

  readonly form = {
    date: signal(initialFormState.date),
    time: signal(initialFormState.time),
    description: signal(initialFormState.description),
  };

  onSubmit(): void {
    const valid = this.validatables()
      .map((field) => field.validate())
      .every(Boolean);
    if (!valid) return;

    this.filmFacade.addViewing(this.film.episodeId, {
      date: this.form.date(),
      time: this.form.time(),
      description: this.form.description(),
    });

    this.clearForm();
  }

  private clearForm(): void {
    (Object.keys(initialFormState) as (keyof typeof initialFormState)[]).forEach((key) => {
      this.form[key].set(initialFormState[key]);
    });
  }

  remove(id: string): void {
    const viewing = this.viewings().find((item) => item.id === id);
    if (!viewing || this.confirming) return;

    this.confirming = true;
    const date = flatpickr.formatDate(flatpickr.parseDate(viewing.date, "Y-m-d")!, "M j, Y");
    this.modal
      .open<boolean, ConfirmModalData>(ConfirmModal, {
        data: {
          title: "Delete viewing?",
          message: `Delete the viewing recorded for ${date}, ${viewing.time}? This action cannot be undone.`,
          confirmLabel: "Delete",
        },
        role: "alertdialog",
        ariaLabel: "Delete viewing?",
        ariaDescribedBy: "confirm-modal-message",
        autoFocus: ".confirm-modal__cancel button",
      })
      .closed.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((confirmed) => {
        this.confirming = false;
        if (confirmed !== true) return;
        this.filmFacade.removeViewing(this.film.episodeId, id);
        this.notifications.success("Viewing deleted.");
      });
  }

  private focusAfterRender(selector: string): void {
    afterNextRender(
      () => this.element.nativeElement.querySelector<HTMLElement>(selector)?.focus(),
      {
        injector: this.injector,
      },
    );
  }
}
