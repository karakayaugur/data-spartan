import { ChangeDetectionStrategy, Component, effect, input, signal } from "@angular/core";
import { CastMember } from "@core/http/film";
import { CharacterPanel } from "../character-panel/character-panel";

@Component({
  selector: "app-film-cast",
  imports: [CharacterPanel],
  templateUrl: "./film-cast.component.html",
  styleUrl: "./film-cast.component.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilmCastComponent {
  readonly cast = input.required<readonly CastMember[]>();
  readonly selectedCharacterId = signal<number | null>(null);

  constructor() {
    effect(() => {
      this.cast();
      this.selectedCharacterId.set(null);
    });
  }

  openCharacter(id: number): void {
    this.selectedCharacterId.set(id);
  }
}
