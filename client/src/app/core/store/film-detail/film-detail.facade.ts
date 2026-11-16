import { inject, Injectable } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { catchError, defer, map, of, startWith, Subject, switchMap } from "rxjs";
import { FilmService } from "@core/http";
import { FilmDetailStore } from "./film-detail.store";
import { FilmDetailState, INITIAL_FILM_DETAIL_STATE } from "./film-detail.types";

@Injectable()
export class FilmDetailFacade {
  private readonly store = inject(FilmDetailStore);
  private readonly filmApi = inject(FilmService);
  private readonly selection = new Subject<number | null>();

  readonly selectedFilm = this.store.selectedFilm;
  readonly loading = this.store.loading;
  readonly error = this.store.error;

  constructor() {
    this.selection
      .pipe(
        switchMap((episodeId) =>
          episodeId === null
            ? of(INITIAL_FILM_DETAIL_STATE)
            : defer(() => this.filmApi.getByEpisodeId(episodeId)).pipe(
                map((selectedFilm): FilmDetailState => ({
                  selectedFilm,
                  loading: false,
                  error: false,
                })),
                catchError(() =>
                  of<FilmDetailState>({ selectedFilm: null, loading: false, error: true }),
                ),
                startWith<FilmDetailState>({ selectedFilm: null, loading: true, error: false }),
              ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((state) => this.store.setState(state));
  }

  loadFilmDetail(episodeId: number): void {
    this.selection.next(episodeId);
  }

  clear(): void {
    this.selection.next(null);
  }
}
