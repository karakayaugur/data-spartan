import { ModalService, ViewingLog } from "@shared/modals";
import { NgTemplateOutlet } from "@angular/common";
import { Component, computed, DestroyRef, inject, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ActivatedRoute } from "@angular/router";
import { map, switchMap, tap } from "rxjs";
import { Film, FilmService } from "@core/http";
import { FilmFacade } from "@core/store";
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
  private readonly service = inject(FilmService);
  private readonly filmFacade = inject(FilmFacade);
  private readonly destroyRef = inject(DestroyRef);
  readonly film = signal<Film | null>(null);
  readonly viewingCount = computed(() => {
    return this.film() ? this.filmFacade.getViewings(this.film()!.id).length : 0;
  });
  readonly loading = signal(true);

  constructor() {
    this.route.paramMap
      .pipe(
        map((params) => Number(params.get("id"))),
        tap(() => {
          this.film.set(null);
          this.loading.set(true);
        }),
        switchMap((id) => this.service.getById(id)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (film) => {
          this.film.set(film);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        },
      });
  }

  openViewingModal(): void {
    const film = this.film();
    if (film) this.modal.open(ViewingLog, { data: film, ariaLabel: film.title });
  }
}
