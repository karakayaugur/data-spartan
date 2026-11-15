import { DatePipe } from "@angular/common";
import { ModalComponent } from "../modal/modal.component";
import { InputTimeComponent } from "@shared/shared-ui";
import { Component, computed, inject, signal, viewChildren } from "@angular/core";
import { DIALOG_DATA } from "@angular/cdk/dialog";
import { FilmSummary } from "@core/http";
import { FilmFacade } from "@core/store";
import { ButtonComponent } from "@shared/ui/buttons/button/button.component";
import { VALIDATABLE } from "@shared/models/validatable.model";
import { InputDateComponent } from "@shared/ui/inputs/input-date/input-date.component";
import { InputTextareaComponent } from "@shared/ui/inputs/input-textarea/input-textarea.component";

const initialFormState = {
  date: "",
  time: "",
  description: "",
};

@Component({
  selector: "app-viewing-log",
  host: { class: "viewing-log" },
  imports: [
    DatePipe,
    ModalComponent,
    InputDateComponent,
    InputTimeComponent,
    InputTextareaComponent,
    ButtonComponent,
  ],
  templateUrl: "./viewing-log.html",
  styleUrl: "./viewing-log.scss",
})
export class ViewingLog {
  readonly film = inject<FilmSummary>(DIALOG_DATA);
  private readonly filmFacade = inject(FilmFacade);
  private readonly validatables = viewChildren(VALIDATABLE);
  readonly viewings = computed(() => this.filmFacade.getViewings(this.film.id));

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

    this.filmFacade.addViewing(this.film.id, {
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
    this.filmFacade.removeViewing(this.film.id, id);
  }
}
