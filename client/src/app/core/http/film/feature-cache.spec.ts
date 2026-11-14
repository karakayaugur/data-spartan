import { TestBed } from "@angular/core/testing";
import { provideHttpClient } from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { globalCacheBusterNotifier } from "ts-cacheable";
import { FilmService } from "./film.service";
import { CharacterService } from "../character/character.service";

describe("Feature service caches", () => {
  beforeEach(() => {
    globalCacheBusterNotifier.next();
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
  });
  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
    globalCacheBusterNotifier.next();
  });

  it("caches repeated IDs and retains earlier films and characters", () => {
    const http = TestBed.inject(HttpTestingController);
    const films = TestBed.inject(FilmService);
    const characters = TestBed.inject(CharacterService);
    for (const id of [1, 2]) {
      films.getById(id).subscribe();
      http.expectOne(`/proxyUrl/films/${id}`).flush({ id, title: `Film ${id}`, cast: [] });
      characters.getById(id).subscribe();
      http.expectOne(`/proxyUrl/characters/${id}`).flush({ id, name: `Character ${id}` });
      films.getById(id).subscribe();
      characters.getById(id).subscribe();
      http.expectNone(() => true);
    }
    let title = "";
    let name = "";
    films.getById(1).subscribe(value => title = value.title);
    characters.getById(1).subscribe(value => name = value.name);
    http.expectNone(() => true);
    expect(title).toBe("Film 1");
    expect(name).toBe("Character 1");
  });
});
