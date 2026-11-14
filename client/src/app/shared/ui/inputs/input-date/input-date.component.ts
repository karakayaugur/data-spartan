import {
  Component,
  computed,
  ElementRef,
  HostListener,
  inject,
  input,
  model,
  signal,
} from '@angular/core';
import { LucideDynamicIcon } from '@lucide/angular';
import { Validatable, VALIDATABLE } from '@shared/models/validatable.model';

export type InputDateType = 'date' | 'time';

interface CalendarDay {
  date: Date;
  inMonth: boolean;
  iso: string;
}

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

@Component({
  selector: 'app-input-date',
  standalone: true,
  imports: [LucideDynamicIcon],
  templateUrl: './input-date.component.html',
  styleUrl: './input-date.component.css',
  providers: [{ provide: VALIDATABLE, useExisting: InputDateComponent }],
  host: {
    '[class.open]': 'open()',
  },
})
export class InputDateComponent implements Validatable {
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly value = model('');
  readonly inputId = input.required<string>();
  readonly name = input('date');
  readonly label = input('Date');
  readonly required = input(true);
  readonly type = input<InputDateType>('date');

  readonly error = signal('');
  readonly open = signal(false);
  readonly viewMonth = signal(0);
  readonly viewYear = signal(new Date().getFullYear());

  readonly months = MONTHS;
  readonly weekdays = WEEKDAYS;
  readonly hours = Array.from({ length: 24 }, (_, index) => String(index).padStart(2, '0'));
  readonly minutes = Array.from({ length: 12 }, (_, index) => String(index * 5).padStart(2, '0'));
  readonly selectedHour = signal('00');
  readonly selectedMinute = signal('00');

  readonly displayValue = computed(() => {
    if (this.type() === 'time') return this.value();
    const parsed = this.parseIsoDate(this.value());
    return parsed ? this.formatDisplay(parsed) : '';
  });

  readonly years = computed(() => {
    const endYear = new Date().getFullYear();
    const startYear = endYear - 120;
    const list: number[] = [];

    for (let year = endYear; year >= startYear; year -= 1) {
      list.push(year);
    }

    return list;
  });

  readonly calendarDays = computed(() => {
    const year = this.viewYear();
    const month = this.viewMonth();
    const days: CalendarDay[] = [];
    const firstDay = new Date(year, month, 1);
    const startOffset = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    for (let index = startOffset - 1; index >= 0; index -= 1) {
      const day = prevMonthDays - index;
      const date = new Date(year, month - 1, day);
      days.push(this.toCalendarDay(date, false));
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = new Date(year, month, day);
      days.push(this.toCalendarDay(date, true));
    }

    let nextDay = 1;
    while (days.length % 7 !== 0 || days.length < 42) {
      const date = new Date(year, month + 1, nextDay);
      days.push(this.toCalendarDay(date, false));
      nextDay += 1;
    }

    return days;
  });

  // --- VALIDATABLE ---

  validate(): boolean {
    const val = this.value();

    if (!val) {
      this.error.set(this.required() ? 'Please fill this field.' : '');
      return !this.required();
    }

    if (this.type() === 'time') {
      const valid = /^([01]\d|2[0-3]):[0-5]\d$/.test(val);
      this.error.set(valid ? '' : 'Please enter a valid time.');
      return valid;
    }

    const date = this.parseIsoDate(val);
    if (!date) {
      this.error.set('Enter a valid date.');
      return false;
    }

    this.error.set('');
    return true;
  }

  setError(message: string): void {
    this.error.set(message);
  }

  selectTime(part: 'hour' | 'minute', value: string): void {
    if (part === 'hour') this.selectedHour.set(value);
    else this.selectedMinute.set(value);
    this.updateTime();
  }

  private updateTime(): void {
    this.value.set(`${this.selectedHour()}:${this.selectedMinute()}`);
    if (this.error()) this.validate();
  }

  // --- Calendar UI ---

  toggle(event: Event): void {
    event.stopPropagation();

    if (this.open()) {
      this.close();
      return;
    }

    if (this.type() === 'time') {
      const [hour, minute] = this.value().split(':');
      this.selectedHour.set(this.hours.includes(hour) ? hour : '00');
      this.selectedMinute.set(/^[0-5]\d$/.test(minute ?? '') ? minute : '00');
      if (!this.value()) this.updateTime();
    } else {
      this.syncViewToSelection();
    }
    this.open.set(true);
  }

  close(): void {
    this.open.set(false);
    this.elementRef.nativeElement.querySelector<HTMLButtonElement>('.date-trigger')?.focus();
  }

  onMonthChange(event: Event): void {
    this.viewMonth.set(Number((event.target as HTMLSelectElement).value));
  }

  onYearChange(event: Event): void {
    this.viewYear.set(Number((event.target as HTMLSelectElement).value));
  }

  selectDay(day: CalendarDay): void {
    this.value.set(day.iso);
    this.close();

    if (this.error()) {
      this.validate();
    }
  }

  isSelected(day: CalendarDay): boolean {
    return !!this.value() && day.iso === this.value();
  }

  isToday(day: CalendarDay): boolean {
    const today = new Date();
    return (
      day.date.getFullYear() === today.getFullYear() &&
      day.date.getMonth() === today.getMonth() &&
      day.date.getDate() === today.getDate()
    );
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.open()) {
      return;
    }

    if (!this.elementRef.nativeElement.contains(event.target as Node)) {
      this.close();
    }
  }

  @HostListener('keydown.escape', ['$event'])
  onEscape(event: Event): void {
    if (this.open()) {
      event.stopPropagation();
      this.close();
    }
  }

  // --- Private ---

  private syncViewToSelection(): void {
    const selected = this.parseIsoDate(this.value());
    const date = selected ?? new Date();
    this.viewMonth.set(date.getMonth());
    this.viewYear.set(date.getFullYear());
  }

  private toCalendarDay(date: Date, inMonth: boolean): CalendarDay {
    return { date, inMonth, iso: this.toIsoDate(date) };
  }

  private parseIsoDate(value: string | undefined): Date | null {
    if (!value) {
      return null;
    }

    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) {
      return null;
    }

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const date = new Date(year, month - 1, day);

    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      return null;
    }

    return date;
  }

  private toIsoDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private formatDisplay(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day} / ${month} / ${year}`;
  }
}
