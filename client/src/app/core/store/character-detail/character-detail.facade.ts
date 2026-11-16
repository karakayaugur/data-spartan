import { inject, Injectable } from "@angular/core";
import { takeUntilDestroyed, toObservable } from "@angular/core/rxjs-interop";
import {
  catchError,
  combineLatest,
  defer,
  forkJoin,
  map,
  of,
  startWith,
  Subject,
  switchMap,
} from "rxjs";
import { PlanetService, SpecieService } from "@core/http";
import { CastListFacade } from "../cast-list/cast-list.facade";
import { CharacterDetailStore } from "./character-detail.store";
import type { CharacterDetailState } from "./character-detail.types";

@Injectable()
export class CharacterDetailFacade {
  private readonly cast = inject(CastListFacade);
  private readonly planets = inject(PlanetService);
  private readonly speciesApi = inject(SpecieService);
  private readonly reload = new Subject<void>();
  private readonly store = new CharacterDetailStore();
  readonly character = this.cast.selectedCharacter;
  readonly species = this.store.species;
  readonly homeworldName = this.store.homeworldName;
  readonly loading = this.store.loading;
  readonly error = this.store.error;

  constructor() {
    combineLatest([toObservable(this.character), this.reload.pipe(startWith(undefined))])
      .pipe(
        switchMap(([person]) =>
          defer(() => {
            if (!person || person.isDroid) {
              return of<CharacterDetailState>({
                species: [],
                homeworldName: null,
                loading: false,
                error: false,
              });
            }
            const species$ = person.species.length
              ? forkJoin(
                  person.species.map((url) =>
                    this.speciesApi.getById(this.resourceId(url, "species")),
                  ),
                )
              : of([]);
            const homeworld$ = person.homeworld
              ? this.planets
                  .getById(this.resourceId(person.homeworld, "planets"))
                  .pipe(map((planet) => planet.name))
              : of(null);
            return forkJoin({ species: species$, homeworldName: homeworld$ }).pipe(
              map((details): CharacterDetailState => ({
                ...details,
                loading: false,
                error: false,
              })),
            );
          }).pipe(
            catchError(() =>
              of<CharacterDetailState>({
                species: [],
                homeworldName: null,
                loading: false,
                error: true,
              }),
            ),
            startWith<CharacterDetailState>({
              species: [],
              homeworldName: null,
              loading: true,
              error: false,
            }),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((state) => this.store.setState(state));
  }

  retry(): void {
    this.reload.next();
  }

  private resourceId(url: string, resource: "species" | "planets"): number {
    const match = new RegExp(`/${resource}/([1-9]\\d*)/?$`).exec(new URL(url).pathname);
    if (!match) throw new Error(`Invalid ${resource} URL`);
    return Number(match[1]);
  }
}
