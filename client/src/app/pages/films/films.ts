import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { RouterLink } from "@angular/router";
import { FilmStoreService } from "@core/store";

@Component({
  selector: "app-films",
  imports: [RouterLink],
  templateUrl: "./films.html",
  styleUrl: "./films.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Films {
  readonly films = inject(FilmStoreService).films;
}
