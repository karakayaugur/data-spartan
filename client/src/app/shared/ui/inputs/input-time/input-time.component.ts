import { InputFeedbackComponent } from "../input-feedback/input-feedback.component";
import { Component, ElementRef, HostListener, inject, input, model, signal } from "@angular/core";
import { LucideDynamicIcon } from "@lucide/angular";
import { Validatable, VALIDATABLE } from "@shared/models/validatable.model";

@Component({
  selector: "app-input-time",
  imports: [LucideDynamicIcon, InputFeedbackComponent],
  templateUrl: "./input-time.component.html",
  styleUrl: "./input-time.component.scss",
  providers: [{ provide: VALIDATABLE, useExisting: InputTimeComponent }],
  host: {
    class: "input-time",
    "[class.input-time--open]": "open()",
  },
})
export class InputTimeComponent implements Validatable {
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly value = model("");
  readonly inputId = input.required<string>();
  readonly name = input("time");
  readonly label = input("Time");
  readonly required = input(true);
  readonly error = signal("");
  readonly open = signal(false);
  readonly draft = signal<string | null>(null);
  readonly hours = Array.from({ length: 24 }, (_, index) => String(index).padStart(2, "0"));
  readonly minutes = Array.from({ length: 12 }, (_, index) => String(index * 5).padStart(2, "0"));
  readonly selectedHour = signal("00");
  readonly selectedMinute = signal("00");

  validate(): boolean {
    const value = this.value();
    const valid = value ? /^([01]\d|2[0-3]):[0-5]\d$/.test(value) : !this.required();
    this.error.set(valid ? "" : value ? "Please enter a valid time." : "Please fill this field.");
    return valid;
  }

  setError(message: string): void {
    this.error.set(message);
  }

  editTime(event: Event): void {
    this.draft.set((event.target as HTMLInputElement).value);
  }

  commitTime(): void {
    const draft = this.draft();
    if (draft === null) return;
    this.draft.set(null);
    const text = draft.trim().toLowerCase();
    if (!text) {
      this.value.set("");
      if (this.error()) this.validate();
      return;
    }
    const match =
      /^(\d{1,2}):(\d{2})\s*(am|pm)?$/.exec(text) ?? /^(\d{1,2})(\d{2})\s*(am|pm)?$/.exec(text);
    if (!match) return;
    let hour = Number(match[1]);
    const minute = Number(match[2]);
    const period = match[3];
    if (minute > 59 || (period ? hour < 1 || hour > 12 : hour > 23)) return;
    if (period) hour = (hour % 12) + (period === "pm" ? 12 : 0);
    const total = (Math.round((hour * 60 + minute) / 5) * 5) % (24 * 60);
    this.selectedHour.set(String(Math.floor(total / 60)).padStart(2, "0"));
    this.selectedMinute.set(String(total % 60).padStart(2, "0"));
    this.updateTime();
  }

  onTimeEnter(event: Event): void {
    event.preventDefault();
    this.commitTime();
  }

  selectTime(part: "hour" | "minute", value: string): void {
    if (part === "hour") this.selectedHour.set(value);
    else this.selectedMinute.set(value);
    this.updateTime();
  }

  private updateTime(): void {
    this.draft.set(null);
    this.value.set(`${this.selectedHour()}:${this.selectedMinute()}`);
    if (this.error()) this.validate();
  }

  toggle(event: Event): void {
    event.stopPropagation();
    if (this.open()) {
      this.close();
      return;
    }
    this.commitTime();
    const [hour, minute] = this.value().split(":");
    this.selectedHour.set(this.hours.includes(hour) ? hour : "00");
    this.selectedMinute.set(/^[0-5]\d$/.test(minute ?? "") ? minute : "00");
    if (!this.value()) this.updateTime();
    this.open.set(true);
  }

  close(): void {
    this.open.set(false);
    this.elementRef.nativeElement.querySelector<HTMLInputElement>(".input-time__input")?.focus();
  }

  @HostListener("document:click", ["$event"])
  onDocumentClick(event: MouseEvent): void {
    if (this.open() && !this.elementRef.nativeElement.contains(event.target as Node)) this.close();
  }

  @HostListener("keydown.escape", ["$event"])
  onEscape(event: Event): void {
    if (this.open()) {
      event.stopPropagation();
      this.close();
    }
  }
}
