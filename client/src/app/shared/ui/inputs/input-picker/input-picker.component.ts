import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  effect,
  inject,
  input,
  model,
  signal,
  viewChild,
} from "@angular/core";
import {
  LucideDynamicIcon,
  LucideCalendar,
  LucideClock,
  provideLucideIcons,
} from "@lucide/angular";
import flatpickr from "flatpickr";
import type { Instance } from "flatpickr/dist/types/instance";
import { Validatable, VALIDATABLE } from "@shared/models/validatable.model";
import { InputFeedbackComponent } from "../input-feedback/input-feedback.component";

@Component({
  selector: "app-input-picker",
  imports: [LucideDynamicIcon, InputFeedbackComponent],
  providers: [
    provideLucideIcons(LucideCalendar, LucideClock),
    { provide: VALIDATABLE, useExisting: InputPickerComponent },
  ],
  host: {
    class: "input-picker",
    "[attr.data-type]": "type()",
    "(keydown.escape)": "onEscape($event)",
  },
  templateUrl: "./input-picker.component.html",
  styleUrl: "./input-picker.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputPickerComponent implements Validatable {
  readonly value = model("");
  readonly inputId = input.required<string>();
  readonly label = input.required<string>();
  readonly type = input<"date" | "time">("date");
  readonly required = input(true);
  readonly min = input("");
  readonly max = input("");
  readonly error = signal("");
  private readonly field = viewChild.required<ElementRef<HTMLInputElement>>("field");
  private readonly ready = signal(false);
  private picker?: Instance;

  constructor() {
    afterNextRender(() => {
      this.picker = flatpickr(this.field().nativeElement, {
        enableTime: this.type() === "time",
        noCalendar: this.type() === "time",
        dateFormat: this.type() === "time" ? "H:i" : "Y-m-d",
        time_24hr: true,
        minuteIncrement: 5,
        defaultHour: 0,
        defaultMinute: 0,
        disableMobile: true,
        static: true,
        allowInput: false,
        locale: { firstDayOfWeek: 1 },
        onReady: (_, __, picker) => {
          if (this.type() === "date") {
            picker.currentYearElement.readOnly = true;
          }
        },
        onChange: (_, value) => {
          this.value.set(value);
          if (this.error()) this.validate();
        },
        onOpen: () => {
          if (this.type() === "time" && !this.value()) this.picker?.setDate("00:00", true);
        },
      });
      this.ready.set(true);
    });
    effect(() => {
      const value = this.value();
      const min = this.min();
      const max = this.max();
      if (!this.ready()) return;
      if (this.type() === "date") {
        this.picker?.set("minDate", min || undefined);
        this.picker?.set("maxDate", max || undefined);
      }
      this.picker?.setDate(value, false);
      if (!value) this.error.set("");
    });
    inject(DestroyRef).onDestroy(() => this.picker?.destroy());
  }

  open(): void {
    this.picker?.open();
  }

  onEscape(event: Event): void {
    if (this.picker?.isOpen) {
      event.stopPropagation();
      this.picker.close();
      this.field().nativeElement.focus();
    }
  }

  validate(): boolean {
    const value = this.value();
    let message = "";
    if (!value && this.required()) message = "Please fill this field.";
    else if (value && this.type() === "time" && !/^([01]\d|2[0-3]):[0-5]\d$/.test(value))
      message = "Enter a valid time.";
    else if (value && this.type() === "date") {
      const date = flatpickr.parseDate(value, "Y-m-d");
      if (
        !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
        !date ||
        flatpickr.formatDate(date, "Y-m-d") !== value
      )
        message = "Enter a valid date.";
      else if (this.min() && value < this.min())
        message = `Choose a date on or after ${this.min()}.`;
      else if (this.max() && value > this.max())
        message = `Choose a date on or before ${this.max()}.`;
    }
    this.error.set(message);
    return !message;
  }

  setError(message: string): void {
    this.error.set(message);
  }
}
