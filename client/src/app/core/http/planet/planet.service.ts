import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Cacheable } from "ts-cacheable";
import { Planet, Planets } from "./planet.interface";

@Injectable({ providedIn: "root" })
export class PlanetService {
  private readonly apiUrl = "/proxyUrl/planets";
  private readonly http = inject(HttpClient);

  @Cacheable()
  getAll(): Observable<Planets> {
    return this.http.get<Planets>(this.apiUrl);
  }

  @Cacheable({ maxCacheCount: 100 })
  getById(id: number): Observable<Planet> {
    return this.http.get<Planet>(`${this.apiUrl}/${id}`);
  }
}
