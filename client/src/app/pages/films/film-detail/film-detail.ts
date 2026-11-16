import { Component, computed, DestroyRef, inject, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ActivatedRoute } from "@angular/router";
import { map } from "rxjs";
import { FilmFacade, FilmDetailFacade } from "@core/store";
import { ModalService, ViewingLog } from "@shared/modals";
import { FilmHeaderComponent } from "./components/film-header/film-header.component";
import { FilmCrawlComponent } from "./components/film-crawl/film-crawl.component";
import { FilmCastComponent } from "./components/film-cast/film-cast.component";

@Component({
  selector: "app-film-detail",
  host: { class: "film-detail" },
  imports: [FilmHeaderComponent, FilmCrawlComponent, FilmCastComponent],
  templateUrl: "./film-detail.html",
  styleUrl: "./film-detail.scss",
})
export class FilmDetail {
  private readonly modal = inject(ModalService);
  private readonly route = inject(ActivatedRoute);
  private readonly filmDetailFacade = inject(FilmDetailFacade);
  private readonly filmFacade = inject(FilmFacade);
  private readonly destroyRef = inject(DestroyRef);

  readonly film = this.filmDetailFacade.selectedFilm;
  readonly cast = this.filmDetailFacade.cast;
  readonly loading = this.filmDetailFacade.loading;
  readonly castLoading = this.filmDetailFacade.castLoading;

  readonly viewingCount = computed(() => {
    const currentFilm = this.film();
    return currentFilm ? this.filmFacade.getViewings(currentFilm.episodeId).length : 0;
  });

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        map((params) => Number(params.get("episodeId"))),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((episodeId) => {
        if (episodeId) {
          this.filmDetailFacade.loadFilmDetail(episodeId);
        }
      });
  }

  openViewingModal(): void {
    const film = this.film();
    if (film) this.modal.open(ViewingLog, { data: film, ariaLabel: film.title });
  }
}
