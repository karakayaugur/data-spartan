import { Component, input, model, signal } from "@angular/core";
import { LucideDynamicIcon } from "@lucide/angular";
import { Validatable, VALIDATABLE } from "@shared/models/validatable.model";

@Component({
  selector: "app-input-text",
  standalone: true,
  imports: [LucideDynamicIcon],
  templateUrl: "./input-text.component.html",
  styleUrl: "./input-text.component.css",
  providers: [{ provide: VALIDATABLE, useExisting: InputTextComponent }],
})
export class InputTextComponent implements Validatable {
  readonly value = model("");
  readonly inputId = input.required<string>();
  readonly name = input("");
  readonly label = input("");
  readonly placeholder = input("");
  readonly hasError = input(false);
  readonly readonly = input(false);
  readonly autocomplete = input("off");
  readonly minLength = input(0);
  readonly required = input(true);
  /** When true, only non-negative integers (digits) are accepted. */
  readonly integer = input(false);

  readonly error = signal("");

  validate(): boolean {
    const val = String(this.value() ?? "").trim();
    this.value.set(val);

    if (this.required() && !val) {
      this.error.set("Please fill this field.");
      return false;
    }

    if (this.minLength() > 0 && val.length < this.minLength()) {
      this.error.set(`Must be at least ${this.minLength()} characters.`);
      return false;
    }

    if (this.integer() && val) {
      if (!/^\d+$/.test(val)) {
        this.error.set("Must be a non-negative integer.");
        return false;
      }
    }

    this.error.set("");
    return true;
  }

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let next = input.value;
    if (this.integer()) {
      next = next.replace(/\D/g, "");
      input.value = next;
    }
    this.value.set(next);
    if (this.error()) {
      this.validate();
    }
  }

  setError(message: string): void {
    this.error.set(message);
  }
}
