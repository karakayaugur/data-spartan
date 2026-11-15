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
import { ButtonComponent } from "../../buttons/button/button.component";

@Component({
  selector: "app-input-picker",
  imports: [LucideDynamicIcon, InputFeedbackComponent, ButtonComponent],
  providers: [
    provideLucideIcons(LucideCalendar, LucideClock),
    { provide: VALIDATABLE, useExisting: InputPickerComponent },
  ],
  host: {
    class: "input-picker",
    "[attr.data-type]": "type()",
    "[attr.data-size]": "size()",
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
  readonly size = input<"small" | "medium" | "large">("medium");
  readonly required = input(true);
  readonly min = input("");
  readonly max = input("");
  readonly error = signal("");
  private readonly field = viewChild.required<ElementRef<HTMLInputElement>>("field");
  private readonly ready = signal(false);
  readonly nativeTime = signal(false);
  readonly timeOpen = signal(false);
  readonly selectedHour = signal<string | null>(null);
  readonly selectedMinute = signal<string | null>(null);
  readonly hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
  readonly minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));
  private readonly timePanel = viewChild<ElementRef<HTMLDivElement>>("timePanel");
  private picker?: Instance;
  private popoverHost?: HTMLDivElement;

  private positionPopover(picker: Instance): void {
    this.positionPanel(picker.calendarContainer);
  }

  private positionPanel(calendar: HTMLElement): void {
    const field = this.field().nativeElement;
    const bounds = field.getBoundingClientRect();
    const viewport = field.ownerDocument.documentElement;
    const width = Math.min(this.type() === "time" ? 240 : 320, viewport.clientWidth - 16);
    calendar.style.width = `${width}px`;
    calendar.style.maxHeight = "none";
    const height = calendar.offsetHeight;
    const below = viewport.clientHeight - bounds.bottom - 16;
    const above = bounds.top - 16;
    const showAbove = height > below && above > below;
    const available = Math.max(0, showAbove ? above : below);
    calendar.style.maxHeight = `${available}px`;
    calendar.style.left = `${Math.max(8, Math.min(bounds.left, viewport.clientWidth - width - 8))}px`;
    calendar.style.top = `${showAbove ? Math.max(8, bounds.top - Math.min(height, available) - 8) : bounds.bottom + 8}px`;
  }

  constructor() {
    afterNextRender(() => {
      if (this.type() === "time") {
        this.nativeTime.set(window.matchMedia("(pointer: coarse)").matches);
        return;
      }
      const field = this.field().nativeElement;
      this.popoverHost = field.ownerDocument.createElement("div");
      this.popoverHost.className = "input-picker input-picker-popover";
      (field.closest("cdk-dialog-container") ?? field.ownerDocument.body).appendChild(
        this.popoverHost,
      );
      this.picker = flatpickr(this.field().nativeElement, {
        enableTime: this.type() === "time",
        noCalendar: this.type() === "time",
        dateFormat: this.type() === "time" ? "H:i" : "Y-m-d",
        time_24hr: true,
        minuteIncrement: 5,
        defaultHour: 0,
        defaultMinute: 0,
        disableMobile: true,
        appendTo: this.popoverHost,
        position: (picker) => this.positionPopover(picker),
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
        onOpen: (_, __, picker) => {
          this.positionPopover(picker);
        },
      });
      this.ready.set(true);
    });
    effect(() => {
      const value = this.value();
      const min = this.min();
      const max = this.max();
      if (this.type() === "time" && !value) this.error.set("");
      if (!this.ready()) return;
      if (this.type() === "date") {
        this.picker?.set("minDate", min || undefined);
        this.picker?.set("maxDate", max || undefined);
      }
      this.picker?.setDate(value, false);
      if (!value) this.error.set("");
    });
    const reposition = () => {
      if (this.picker?.isOpen) this.positionPopover(this.picker);
      if (this.timeOpen() && this.timePanel()) this.positionPanel(this.timePanel()!.nativeElement);
    };
    const closeOutside = (event: PointerEvent) => {
      if (!this.timeOpen()) return;
      const target = event.target as Node;
      if (
        !this.timePanel()?.nativeElement.contains(target) &&
        !this.field().nativeElement.parentElement?.contains(target)
      )
        this.closeTime();
    };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    inject(DestroyRef).onDestroy(() => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
      this.picker?.destroy();
      this.popoverHost?.remove();
    });
  }

  open(): void {
    if (this.type() === "time") {
      if (this.nativeTime()) {
        const field = this.field().nativeElement;
        field.focus();
        field.showPicker?.();
        return;
      }
      const [hour, minute] = this.value().split(":");
      this.selectedHour.set(hour || null);
      this.selectedMinute.set(minute || null);
      const panel = this.timePanel()?.nativeElement;
      if (!panel || this.timeOpen()) return;
      panel.showPopover();
      this.timeOpen.set(true);
      this.positionPanel(panel);
      panel.querySelectorAll<HTMLElement>(".input-picker__time-list").forEach((list) => {
        const selected = list.querySelector<HTMLElement>("[aria-pressed='true']");
        list.scrollTop = selected
          ? selected.offsetTop - (list.clientHeight - selected.offsetHeight) / 2
          : 0;
      });
      panel
        .querySelector<HTMLButtonElement>("button[aria-pressed='true'], button")
        ?.focus({ preventScroll: true });
      return;
    }
    this.picker?.open();
  }

  closeTime(restoreFocus = false): void {
    this.timePanel()?.nativeElement.hidePopover();
    this.timeOpen.set(false);
    if (restoreFocus) this.field().nativeElement.focus();
  }

  selectTimePart(part: "hour" | "minute", value: string, event: Event): void {
    (part === "hour" ? this.selectedHour : this.selectedMinute).set(value);
    const button = event.currentTarget as HTMLButtonElement;
    const list = button.parentElement!;
    list.scrollTo({
      top: button.offsetTop - (list.clientHeight - button.offsetHeight) / 2,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  }

  applyTime(): void {
    if (this.selectedHour() === null || this.selectedMinute() === null) return;
    this.value.set(`${this.selectedHour()}:${this.selectedMinute()}`);
    if (this.error()) this.validate();
    this.closeTime(true);
  }

  onNativeTime(event: Event): void {
    this.value.set((event.target as HTMLInputElement).value);
    if (this.error()) this.validate();
  }

  onTimeKeydown(event: KeyboardEvent): void {
    if (this.type() !== "time" || this.nativeTime()) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      this.open();
    }
  }

  onTimeFocusout(event: FocusEvent): void {
    if (
      event.relatedTarget &&
      !this.timePanel()?.nativeElement.contains(event.relatedTarget as Node)
    ) {
      this.closeTime();
    }
  }

  onEscape(event: Event): void {
    if (this.timeOpen()) {
      event.preventDefault();
      event.stopPropagation();
      this.closeTime(true);
      return;
    }
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
