import { DatePipe } from "@angular/common";
import { inject, LOCALE_ID, Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: "displayDate", standalone: true })
export class DisplayDatePipe implements PipeTransform {
  private readonly datePipe = new DatePipe(inject(LOCALE_ID));

  transform(value: string | number | Date | null | undefined): string {
    return this.datePipe.transform(value, "MMM d, yyyy") ?? "";
  }
}
