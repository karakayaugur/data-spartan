import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { map, Observable } from "rxjs";
import { Cacheable } from "ts-cacheable";
import { Film, Films } from "./film.interface";

@Injectable({ providedIn: "root" })
export class FilmService {
  private readonly apiUrl = "/proxyUrl/films";
  private readonly http = inject(HttpClient);

  @Cacheable()
  getAll(): Observable<Films> {
    return this.http.get<Films>(this.apiUrl);
  }

  @Cacheable({ maxCacheCount: 1000 })
  getByEpisodeId(id: number | string): Observable<Film> {
    return this.getAll().pipe(
      map((films) => {
        const film = films.find((item) => item.episodeId === Number(id));
        if (!film) throw new Error(`Film not found for episode ${id}`);
        return film;
      }),
    );
  }
}
