import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Cacheable } from "ts-cacheable";
import { Film, FilmSummary } from "./film.interface";

@Injectable({ providedIn: "root" })
export class FilmService {
  private readonly apiUrl = "/proxyUrl/films";
  private readonly http = inject(HttpClient);

  @Cacheable()
  getList(): Observable<FilmSummary[]> {
    return this.http.get<FilmSummary[]>(this.apiUrl);
  }

  @Cacheable({ maxCacheCount: 1000 })
  getByEpisodeId(id: number): Observable<Film> {
    return this.http.get<Film>(`${this.apiUrl}/${id}`);
  }
}
