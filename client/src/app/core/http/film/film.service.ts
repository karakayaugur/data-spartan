import { inject, Injectable } from "@angular/core";
import { ApiService } from "../api";
import { Film, FilmSummary } from "./film.interface";
import { Cacheable } from "ts-cacheable";

@Injectable({ providedIn: "root" })
export class FilmService {
  private readonly api = inject(ApiService);

  @Cacheable()
  getList() {
    return this.api.get<FilmSummary[]>("films");
  }

  @Cacheable({ maxCacheCount: 100 })
  getById(id: number) {
    return this.api.get<Film>(`films/${id}`);
  }
}
