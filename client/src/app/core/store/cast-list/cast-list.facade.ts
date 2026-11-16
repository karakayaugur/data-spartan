import { inject, Injectable } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { catchError, defer, forkJoin, map, of, startWith, Subject, switchMap } from "rxjs";
import { PeopleService, Person } from "@core/http";
import { CastListStore } from "./cast-list.store";
import type { CastListState } from "./cast-list.types";

@Injectable()
export class CastListFacade {
  private readonly peopleApi = inject(PeopleService);
  private readonly requests = new Subject<readonly string[]>();
  private urls: readonly string[] = [];
  private readonly store = new CastListStore();

  readonly cast = this.store.cast;
  readonly loading = this.store.loading;
  readonly error = this.store.error;
  readonly failedCount = this.store.failedCount;

  constructor() {
    this.requests
      .pipe(
        switchMap((urls) =>
          defer(() => {
            if (!urls.length)
              return of<CastListState>({ cast: [], loading: false, error: false, failedCount: 0 });
            const requests = urls.map((url) => {
              const match = /\/people\/([1-9]\d*)\/?$/.exec(url);
              if (!match) return of(null);
              const id = Number(match[1]);
              return defer(() => this.peopleApi.getById(id)).pipe(
                map((person): Person => ({ ...person, id, isDroid: this.isDroid(person) })),
                catchError(() => of(null)),
              );
            });
            return forkJoin(requests).pipe(
              map((results): CastListState => {
                const cast = results.filter((person): person is Person => person !== null);
                return {
                  cast,
                  loading: false,
                  error: cast.length === 0,
                  failedCount: results.length - cast.length,
                };
              }),
            );
          }).pipe(
            catchError(() =>
              of<CastListState>({
                cast: [],
                loading: false,
                error: true,
                failedCount: urls.length,
              }),
            ),
            startWith<CastListState>({ cast: [], loading: true, error: false, failedCount: 0 }),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((state) => this.store.setState(state));
  }

  loadCast(urls: readonly string[]): void {
    this.urls = [...urls];
    this.requests.next(this.urls);
  }

  retry(): void {
    this.requests.next(this.urls);
  }

  clear(): void {
    this.loadCast([]);
  }

  private isDroid(character: Person): boolean {
    const isNonRobotsGenders = ["male", "female", "hermaphrodite"].some(
      (gender) => character.gender?.toLowerCase() === gender,
    );
    const droidNamePattern = /^[A-Z0-9]+-[A-Z0-9]+$/i.test(character.name);
    if (isNonRobotsGenders && !droidNamePattern) {
      return false;
    }
    return true;
  }
}
