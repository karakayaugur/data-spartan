import { TestBed } from "@angular/core/testing";
import { FilmsService } from "./films.services";
import { FILMS_STORAGE_KEY } from "./films.types";

const films = [{ id: 1, title: "A New Hope", episodeId: 4, releaseDate: "1977-05-25" }];
const payload = { date: "2026-11-13", time: "19:30", description: "First viewing" };

describe("Films store", () => {
  beforeEach(() => {
    sessionStorage.removeItem(FILMS_STORAGE_KEY);
    sessionStorage.removeItem("data-spartan.viewing-log");
  });
  afterEach(() => {
    TestBed.resetTestingModule();
    sessionStorage.removeItem(FILMS_STORAGE_KEY);
    sessionStorage.removeItem("data-spartan.viewing-log");
  });

  it("shares films and viewings, persists through its effect, and restores the complete state", () => {
    let service = TestBed.inject(FilmsService);
    service.setFilms(films);
    service.addViewing(1, payload);
    service.addViewing(1, { ...payload, time: "21:00" });
    service.addViewing(2, { ...payload, description: "Different film" });
    // Refreshing films must preserve viewing history.
    service.setFilms([...films, { ...films[0], id: 2 }]);
    expect(service.getViewings(1).length).toBe(2);
    TestBed.tick();
    const saved = JSON.parse(sessionStorage.getItem(FILMS_STORAGE_KEY)!);
    expect(saved.films.length).toBe(2);
    expect(saved.viewings[1].length).toBe(2);
    expect(saved.viewings[2].length).toBe(1);

    TestBed.resetTestingModule();
    service = TestBed.inject(FilmsService);
    expect(service.films().length).toBe(2);
    expect(service.getViewings(1).length).toBe(2);
    service.removeViewing(1, service.getViewings(1)[0].id);
    TestBed.tick();
    expect(JSON.parse(sessionStorage.getItem(FILMS_STORAGE_KEY)!).viewings[1].length).toBe(1);
    expect(service.getViewings(2).length).toBe(1);
    service.clearState();
    TestBed.tick();
    expect(JSON.parse(sessionStorage.getItem(FILMS_STORAGE_KEY)!)).toEqual({ films: [], viewings: {} });
  });

  it("preserves viewings from the previous storage layout", () => {
    sessionStorage.setItem("data-spartan.viewing-log", JSON.stringify({ 1: [{ ...payload, id: "existing" }] }));
    const service = TestBed.inject(FilmsService);
    expect(service.getViewings(1)[0].id).toBe("existing");
    TestBed.tick();
    expect(JSON.parse(sessionStorage.getItem(FILMS_STORAGE_KEY)!).viewings[1][0].id).toBe("existing");
  });

  it("starts with empty state when stored JSON is malformed", () => {
    sessionStorage.setItem(FILMS_STORAGE_KEY, "broken json");
    expect(TestBed.inject(FilmsService).state()).toEqual({ films: [], viewings: {} });
  });
});
