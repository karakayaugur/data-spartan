import { inject, Injectable } from "@angular/core";
import { firstValueFrom, forkJoin, of } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { FilmService } from "@core/http/film/film.service";
import { CharacterService } from "@core/http/character/character.service";
import { FilmDetailStore } from "./film-detail.store";
import type { CastMember } from "@core/http/film/film.interface";

@Injectable({ providedIn: "root" })
export class FilmDetailFacade {
  private readonly store = inject(FilmDetailStore);
  private readonly filmApi = inject(FilmService);
  private readonly characterApi = inject(CharacterService);

  readonly selectedFilm = this.store.selectedFilm;
  readonly cast = this.store.cast;
  readonly loading = this.store.loading;
  readonly castLoading = this.store.castLoading;
  readonly error = this.store.error;

  async loadFilmDetail(episodeId: number): Promise<void> {
    this.store.setState({
      loading: true,
      castLoading: false,
      error: false,
      selectedFilm: null,
      cast: [],
    });

    try {
      const film = await firstValueFrom(this.filmApi.getByEpisodeId(episodeId));
      this.store.setState({ selectedFilm: film, loading: false });
      if (film?.characters?.length) {
        await this.loadCast(film.characters);
      }
    } catch {
      this.store.setState({ error: true, loading: false });
    }
  }

  private async loadCast(urls: string[]): Promise<void> {
    this.store.setState({ castLoading: true });
    const ids = urls.map((url) => this.idFromUrl(url)).filter((id): id is number => id !== null);

    if (!ids[0]) {
      this.store.setState({ castLoading: false });
      return;
    }

    const castRequest$ = ids.map((id) =>
      this.characterApi.getById(id).pipe(
        map((person): CastMember => {
          return { ...person, id, isDroid: this.isDroid(person) };
        }),
        catchError(() => of(null)),
      ),
    );

    // TODO: How many requests :( Maybe i should use mergeMap and load 5 by 5 and update the state as they come in.
    const results = await firstValueFrom(forkJoin(castRequest$));
    const validCast = results.filter((c): c is CastMember => c !== null);

    this.store.setState({ cast: validCast, castLoading: false });
  }

  private idFromUrl(url: string): number | null {
    const match = url.match(/\/(\d+)\/?$/);
    return match ? Number(match[1]) : null;
  }

  private isDroid(character: any): boolean {
    const isNonRobotsGenders = ["male", "female", "hermaphrodite"].some(
      (gender) => character.gender?.toLowerCase() === gender,
    );
    const droidNamePattern = /^[A-Z0-9]+-[A-Z0-9]+$/i.test(character.name);
    if (isNonRobotsGenders && !droidNamePattern) {
      return false;
    }
    return true;
  }

  public clear(): void {
    this.store.clearState();
  }
}
