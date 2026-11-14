import { BeautifulEnumPipe } from "./pipes/beautiful-enum.pipe";
import { JsonPipe } from "@angular/common";

export { BeautifulEnumPipe, JsonPipe };

export const SharedPipes = [
  BeautifulEnumPipe,
  JsonPipe,
];
