import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Cacheable } from "ts-cacheable";
import { Character } from "./character.interface";

@Injectable({ providedIn: "root" })
export class CharacterService {
  private readonly apiUrl = "/proxyUrl/people";
  private readonly http = inject(HttpClient);

  @Cacheable({ maxCacheCount: 100 })
  getById(id: number): Observable<Character> {
    return this.http.get<Character>(`${this.apiUrl}/${id}`);
  }
}
