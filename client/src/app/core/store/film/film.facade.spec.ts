import { signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FilmService } from "@core/http";
import { FilmFacade } from "./film.facade";
import { FilmStore } from "./film.store";
import { FilmsState } from "./film.types";

describe("FilmFacade viewing log", () => {
  let facade: FilmFacade;

  beforeEach(() => {
    const state = signal<FilmsState>({ films: [], viewings: {} });
    TestBed.configureTestingModule({
      providers: [
        {
          provide: FilmStore,
          useValue: {
            state: state.asReadonly(),
            patchState: (partial: Partial<FilmsState>) =>
              state.update((current) => ({ ...current, ...partial })),
          },
        },
        { provide: FilmService, useValue: {} },
      ],
    });
    facade = TestBed.inject(FilmFacade);
  });

  afterEach(() => vi.unstubAllGlobals());

  it("adds and removes viewings when randomUUID is unavailable", () => {
    const getRandomValues = globalThis.crypto.getRandomValues.bind(globalThis.crypto);
    vi.stubGlobal("crypto", { getRandomValues });
    const entry = { date: "2020-05-04", time: "20:00", description: "" };

    facade.addViewing(1, entry);
    facade.addViewing(1, entry);
    const [first, second] = facade.getViewings(1);

    expect(first.id).toMatch(/^[a-f0-9]{32}$/);
    expect(first.id).not.toBe(second.id);
    facade.removeViewing(1, first.id);
    expect(facade.getViewings(1)).toEqual([second]);
  });

  it("keeps viewing histories isolated by film", () => {
    const entry = { date: "2020-05-04", time: "20:00", description: "" };
    facade.addViewing(1, entry);
    facade.addViewing(1, { ...entry, time: "21:00" });
    expect(facade.getViewings(1)).toHaveLength(2);
    expect(facade.getViewings(2)).toEqual([]);
  });

  it("removes only the requested viewing without affecting another film", () => {
    const entry = { date: "2020-05-04", time: "20:00", description: "" };
    facade.addViewing(1, entry);
    facade.addViewing(1, { ...entry, time: "21:00" });
    facade.addViewing(2, entry);
    const [remove, keep] = facade.getViewings(1);
    const otherFilm = [...facade.getViewings(2)];
    facade.removeViewing(1, remove.id);
    expect(facade.getViewings(1)).toEqual([keep]);
    expect(facade.getViewings(2)).toEqual(otherFilm);
  });
});
