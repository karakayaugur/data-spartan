import { Component, computed, DestroyRef, inject } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ActivatedRoute } from "@angular/router";
import { map } from "rxjs";
import { FilmFacade, FilmDetailFacade } from "@core/store";
import { FilmDetailStore } from "@core/store/film-detail/film-detail.store";
import { ModalService, ViewingLog } from "@shared/modals";
import { FilmHeader } from "./components/film-header/film-header";
import { FilmCrawl } from "./components/film-crawl/film-crawl";
import { FilmCast } from "./components/film-cast/film-cast";

@Component({
  selector: "app-film-detail",
  host: { class: "film-detail" },
  imports: [FilmHeader, FilmCrawl, FilmCast],
  providers: [FilmDetailFacade, FilmDetailStore],
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
  readonly loading = this.filmDetailFacade.loading;

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
