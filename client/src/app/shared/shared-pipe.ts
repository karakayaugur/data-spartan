import { BeautifulEnumPipe } from "./pipes/beautiful-enum.pipe";
import { JsonPipe } from "@angular/common";
import { DisplayDatePipe } from "./pipes/display-date.pipe";

export { BeautifulEnumPipe, DisplayDatePipe, JsonPipe };

export const SharedPipes = [BeautifulEnumPipe, DisplayDatePipe, JsonPipe];
