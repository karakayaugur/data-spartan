import { Component, computed, input, model, signal } from "@angular/core";
import { LucideDynamicIcon } from "@lucide/angular";
import { Validatable, VALIDATABLE } from "@shared/models/validatable.model";

@Component({
  selector: "app-input-textarea",
  standalone: true,
  imports: [LucideDynamicIcon],
  templateUrl: "./input-textarea.component.html",
  styleUrl: "./input-textarea.component.css",
  providers: [{ provide: VALIDATABLE, useExisting: InputTextareaComponent }],
})
export class InputTextareaComponent implements Validatable {
  readonly value = model("");
  readonly inputId = input.required<string>();
  readonly name = input("");
  readonly label = input("");
  readonly placeholder = input("");
  readonly hasError = input(false);
  readonly readonly = input(false);
  readonly rows = input(4);
  readonly minLength = input(0);
  readonly maxLength = input<number | null>(null);
  readonly required = input(true);

  readonly error = signal("");

  readonly remaining = computed(() => {
    const max = this.maxLength();
    if (max === null) return null;
    return max - (this.value()?.length ?? 0);
  });

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

    this.error.set("");
    return true;
  }

  onInput(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    let val = textarea.value;
    const max = this.maxLength();
    if (max !== null && val.length > max) {
      val = val.slice(0, max);
      textarea.value = val;
    }
    this.value.set(val);
    if (this.error()) {
      this.validate();
    }
  }

  setError(message: string): void {
    this.error.set(message);
  }
}
