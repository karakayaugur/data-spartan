import { ChangeDetectionStrategy, Component, DestroyRef, inject, input } from "@angular/core";
import { takeUntilDestroyed, toObservable } from "@angular/core/rxjs-interop";
import { CastListFacade } from "@core/store";
import { CharacterPanel } from "../character-panel/character-panel";

@Component({
  selector: "app-film-cast",
  host: { class: "film-cast" },
  imports: [CharacterPanel],
  providers: [CastListFacade],
  templateUrl: "./film-cast.html",
  styleUrl: "./film-cast.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilmCast {
  readonly characters = input.required<readonly string[]>();
  private readonly castFacade = inject(CastListFacade);
  private readonly destroyRef = inject(DestroyRef);
  readonly cast = this.castFacade.cast;
  readonly loading = this.castFacade.loading;
  readonly error = this.castFacade.error;
  readonly failedCount = this.castFacade.failedCount;
  readonly selectedCharacterId = this.castFacade.selectedCharacterId;
  readonly selectedCharacter = this.castFacade.selectedCharacter;

  constructor() {
    toObservable(this.characters)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((urls) => {
        this.castFacade.loadCast(urls);
      });
  }

  retryLoading(): void {
    this.castFacade.retry();
  }

  openCharacter(id: number | null): void {
    this.castFacade.selectCharacter(id);
  }
}
