import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Cacheable } from "ts-cacheable";
import { Person, People } from "./people.interface";

@Injectable({ providedIn: "root" })
export class PeopleService {
  private readonly apiUrl = "/proxyUrl/people";
  private readonly http = inject(HttpClient);

  @Cacheable()
  getAll(): Observable<People> {
    return this.http.get<People>(this.apiUrl);
  }

  @Cacheable({ maxCacheCount: 500 })
  getById(id: number): Observable<Person> {
    return this.http.get<Person>(`${this.apiUrl}/${id}`);
  }
}
