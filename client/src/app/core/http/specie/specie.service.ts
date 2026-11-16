import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Cacheable } from "ts-cacheable";
import { Specie, Species } from "./specie.interface";

@Injectable({ providedIn: "root" })
export class SpecieService {
  private readonly apiUrl = "/proxyUrl/species";
  private readonly http = inject(HttpClient);

  @Cacheable()
  getAll(): Observable<Species> {
    return this.http.get<Species>(this.apiUrl);
  }

  @Cacheable({ maxCacheCount: 1000 })
  getById(id: number): Observable<Specie> {
    return this.http.get<Specie>(`${this.apiUrl}/${id}`);
  }
}
