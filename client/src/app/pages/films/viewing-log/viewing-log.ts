import { Component, computed, inject, signal, viewChildren } from "@angular/core";
import { DIALOG_DATA, DialogRef } from "@angular/cdk/dialog";
import { FilmSummary } from "@core/http";
import { FilmsService } from "@core/store";
import { ButtonComponent } from "@shared/ui/buttons/button/button.component";
import { ButtonIconComponent } from "@shared/ui/buttons/button-icon/button-icon.component";
import { VALIDATABLE } from "@shared/models/validatable.model";
import { InputDateComponent } from "@shared/ui/inputs/input-date/input-date.component";
import { InputTextareaComponent } from "@shared/ui/inputs/input-textarea/input-textarea.component";

@Component({
  selector: "app-viewing-log",
  imports: [InputDateComponent, InputTextareaComponent, ButtonIconComponent, ButtonComponent],
  templateUrl: "./viewing-log.html",
  styleUrl: "./viewing-log.css",
})
export class ViewingLog {
  readonly ref = inject(DialogRef);
  readonly film = inject<FilmSummary>(DIALOG_DATA);
  private readonly store = inject(FilmsService);
  private readonly validatables = viewChildren(VALIDATABLE);
  readonly viewings = computed(() => this.store.getViewings(this.film.id));
  readonly form = { date: signal(""), time: signal(""), description: signal("") };

  onSubmit(): void {
    const valid = this.validatables().map(field => field.validate()).every(Boolean);
    if (!valid) return;
    this.store.addViewing(this.film.id, { date: this.form.date(), time: this.form.time(), description: this.form.description() });
    this.form.date.set(""); this.form.time.set(""); this.form.description.set("");
  }

  remove(id: string): void { this.store.removeViewing(this.film.id, id); }
}
