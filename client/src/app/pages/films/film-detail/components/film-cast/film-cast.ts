import { ChangeDetectionStrategy, Component, effect, input, signal } from "@angular/core";
import { Person, People } from "@core/http";
import { CharacterPanel } from "../character-panel/character-panel";

@Component({
  selector: "app-film-cast",
  host: { class: "film-cast" },
  imports: [CharacterPanel],
  templateUrl: "./film-cast.html",
  styleUrl: "./film-cast.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilmCast {
  readonly cast = input.required<People>();
  readonly selectedCharacterId = signal<number | null>(null);

  constructor() {
    effect(() => {
      this.cast();
      this.selectedCharacterId.set(null);
    });
  }

  openCharacter(id: number | null): void {
    this.selectedCharacterId.set(id);
  }
}
