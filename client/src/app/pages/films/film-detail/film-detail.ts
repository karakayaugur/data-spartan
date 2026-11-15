import { Component, computed, DestroyRef, inject, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ActivatedRoute } from "@angular/router";
import { map, switchMap, tap, forkJoin, catchError, of } from "rxjs";
import { Film, FilmService, CharacterService, Character } from "@core/http"; // Servis yollarını projene göre düzenleyebilirsin
import { FilmFacade } from "@core/store";
import { ModalService, ViewingLog } from "@shared/modals";
import { NgTemplateOutlet } from "@angular/common";
import { FilmHeaderComponent } from "./components/film-header/film-header.component";
import { FilmCrawlComponent } from "./components/film-crawl/film-crawl.component";
import { FilmCastComponent } from "./components/film-cast/film-cast.component";

@Component({
  selector: "app-film-detail",
  host: { class: "film-detail" },
  imports: [NgTemplateOutlet, FilmHeaderComponent, FilmCrawlComponent, FilmCastComponent],
  templateUrl: "./film-detail.html",
  styleUrl: "./film-detail.scss",
})
export class FilmDetail {
  private readonly modal = inject(ModalService);
  private readonly route = inject(ActivatedRoute);
  private readonly filmService = inject(FilmService);
  private readonly characterService = inject(CharacterService);
  private readonly filmFacade = inject(FilmFacade);
  private readonly destroyRef = inject(DestroyRef);

  readonly film = signal<Film | null>(null);
  readonly cast = signal<Character[]>([]); // FilmCastComponent'e vereceğimiz cast state'i

  readonly loading = signal(true);
  readonly castLoading = signal(false);

  readonly viewingCount = computed(() => {
    return this.film() ? this.filmFacade.getViewings(this.film()!.episodeId).length : 0;
  });

  constructor() {
    this.route.paramMap
      .pipe(
        map((params) => Number(params.get("episodeId"))),
        tap(() => {
          this.film.set(null);
          this.cast.set([]);
          this.loading.set(true);
        }),
        switchMap((episodeId) => this.filmService.getByEpisodeId(episodeId)),
        tap((film) => {
          this.film.set(film);
          this.loading.set(false);

          // Film geldikten sonra karakter ID'lerini servise gönderiyoruz
          if (film?.characterIds && film.characterIds.length > 0) {
            this.fetchCast(film.characterIds);
          }
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        error: () => {
          this.loading.set(false);
        },
      });
  }

  private fetchCast(characterIds: number[]): void {
    this.castLoading.set(true);

    // Her ID için getById isteği oluşturup forkJoin ile paralel atıyoruz
    const requests = characterIds.map((id) =>
      this.characterService.getById(id).pipe(
        catchError(() => of(null)), // Tek bir karakter patlarsa akışı bozmasın
      ),
    );

    forkJoin(requests)
      .pipe(
        map((results) => results.filter((c): c is Character => c !== null)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (characters) => {
          this.cast.set(characters);
          this.castLoading.set(false);
        },
        error: () => {
          this.castLoading.set(false);
        },
      });
  }

  openViewingModal(): void {
    const film = this.film();
    if (film) this.modal.open(ViewingLog, { data: film, ariaLabel: film.title });
  }
}
