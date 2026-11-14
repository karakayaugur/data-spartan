import { DatePipe } from "@angular/common";
import { Component, computed, DestroyRef, inject, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ActivatedRoute } from "@angular/router";
import { catchError, combineLatest, map, of, startWith, Subject, switchMap, tap } from "rxjs";
import { Film, FilmService } from "@core/http";
import { FilmsService } from "@core/store";
import { CharacterPanel } from "./character-panel/character-panel";

@Component({
  selector: "app-film-detail",
  imports: [DatePipe, CharacterPanel],
  templateUrl: "./film-detail.html",
  styleUrl: "./film-detail.css",
})
export class FilmDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(FilmService);
  private readonly filmsService = inject(FilmsService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly reload = new Subject<void>();
  readonly selectedCharacterId = signal<number | null>(null);
  readonly film = signal<Film | null>(null);
  readonly viewingCount = computed(() => {
    const film = this.film();
    return film ? this.filmsService.getViewings(film.id).length : 0;
  });
  readonly loading = signal(true);
  readonly failed = signal(false);

  constructor() {
    combineLatest([this.route.paramMap, this.reload.pipe(startWith(undefined))]).pipe(
      map(([params]) => Number(params.get("id"))),
      tap(() => { this.film.set(null); this.failed.set(false); this.loading.set(true); this.selectedCharacterId.set(null); }),
      switchMap(id => this.service.getById(id).pipe(catchError(() => { this.failed.set(true); return of(null); }))),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(film => { this.film.set(film); this.loading.set(false); });
  }

  retry(): void { this.reload.next(); }

  openCharacter(id: number): void {
    this.selectedCharacterId.set(id);
  }
}
