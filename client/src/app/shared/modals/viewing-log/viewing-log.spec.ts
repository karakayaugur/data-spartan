import { ComponentFixture, TestBed } from "@angular/core/testing";
import { signal } from "@angular/core";
import { DIALOG_DATA, DialogRef } from "@angular/cdk/dialog";
import { LucidePlus, LucideTrash2, LucideX, provideLucideIcons } from "@lucide/angular";
import { Subject } from "rxjs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Film, FilmService } from "@core/http";
import { FilmFacade } from "@core/store";
import { FilmStore } from "@core/store/film/film.store";
import { FilmsState } from "@core/store/film/film.types";
import { ModalService } from "../modal-service";
import { ConfirmModal } from "../confirm/confirm-modal";
import { ViewingLog } from "./viewing-log";

const film: Film = {
  title: "A New Hope",
  episodeId: 1,
  releaseDate: "1977-05-25",
  openingCrawl: "",
  director: "George Lucas",
  producer: "Gary Kurtz",
  characters: [],
  planets: [],
  starships: [],
  vehicles: [],
  species: [],
  created: "",
  edited: "",
  url: "https://swapi.dev/api/films/1/",
};
const entry = { date: "2020-05-04", time: "20:00", description: "" };

describe("ViewingLog form and interactions", () => {
  let fixture: ComponentFixture<ViewingLog>;
  let facade: FilmFacade;
  let selectedFilm: Film;
  let confirmation: Subject<boolean | undefined>;
  let openConfirmation: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    selectedFilm = film;
    confirmation = new Subject<boolean | undefined>();
    openConfirmation = vi.fn(() => ({ closed: confirmation.asObservable() }));
    const state = signal<FilmsState>({ films: [], viewings: {} });
    vi.stubGlobal(
      "matchMedia",
      vi.fn((query: string) => ({
        matches: true,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    );
    TestBed.configureTestingModule({
      imports: [ViewingLog],
      providers: [
        { provide: DIALOG_DATA, useFactory: () => selectedFilm },
        { provide: DialogRef, useValue: { close: vi.fn() } },
        { provide: ModalService, useValue: { open: openConfirmation } },
        { provide: FilmService, useValue: {} },
        {
          provide: FilmStore,
          useValue: {
            state: state.asReadonly(),
            patchState: (partial: Partial<FilmsState>) =>
              state.update((current) => ({ ...current, ...partial })),
          },
        },
        provideLucideIcons(LucidePlus, LucideTrash2, LucideX),
      ],
    });
    facade = TestBed.inject(FilmFacade);
  });

  afterEach(() => vi.unstubAllGlobals());

  async function render(selected = film): Promise<void> {
    selectedFilm = selected;
    fixture = TestBed.createComponent(ViewingLog);
    await fixture.whenStable();
  }

  async function fill(date: string, time: string): Promise<void> {
    fixture.componentInstance.form.date.set(date);
    fixture.componentInstance.form.time.set(time);
    await fixture.whenStable();
  }

  async function submit(): Promise<void> {
    fixture.nativeElement
      .querySelector("form")
      .dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    await fixture.whenStable();
  }

  it.each([
    ["both date and time are missing", "", ""],
    ["date is missing", "", "20:00"],
    ["time is missing", "2020-05-04", ""],
  ])("does not add a viewing when %s", async (_, date, time) => {
    await render();
    await fill(date, time);
    await submit();
    expect(facade.getViewings(1)).toEqual([]);
    const field = fixture.nativeElement.querySelector(!date ? "#viewing-date" : "#viewing-time");
    expect(field.getAttribute("aria-invalid")).toBe("true");
    expect(fixture.nativeElement.textContent).toContain("Please fill this field.");
  });

  it("adds a viewing without a description and clears the form", async () => {
    await render();
    await fill(entry.date, entry.time);
    await submit();
    expect(facade.getViewings(1)).toHaveLength(1);
    expect(facade.getViewings(1)[0]).toMatchObject(entry);
    expect(fixture.nativeElement.querySelectorAll(".viewing-log__viewing")).toHaveLength(1);
    expect(fixture.nativeElement.querySelector("#viewing-date").value).toBe("");
    expect(fixture.nativeElement.querySelector("#viewing-time").value).toBe("");
    expect(fixture.nativeElement.querySelector("#viewing-description").value).toBe("");
  });

  it("saves an entered description and clears it after submission", async () => {
    await render();
    await fill(entry.date, entry.time);
    const textarea = fixture.nativeElement.querySelector(
      "#viewing-description",
    ) as HTMLTextAreaElement;
    textarea.value = "Watched with friends";
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
    await fixture.whenStable();
    await submit();
    expect(facade.getViewings(1)[0].description).toBe("Watched with friends");
    expect(fixture.nativeElement.querySelector(".viewing-log__description").textContent).toContain(
      "Watched with friends",
    );
    expect(textarea.value).toBe("");
  });

  it("does not show another film's viewings in the modal", async () => {
    facade.addViewing(1, entry);
    facade.addViewing(1, { ...entry, time: "21:00" });
    await render({ ...film, episodeId: 2, title: "The Empire Strikes Back" });
    expect(fixture.nativeElement.querySelectorAll(".viewing-log__viewing")).toHaveLength(0);
    expect(facade.getViewings(1)).toHaveLength(2);
    expect(facade.getViewings(2)).toEqual([]);
  });

  it("removes only the clicked viewing after confirmation", async () => {
    facade.addViewing(1, entry);
    facade.addViewing(1, { ...entry, time: "21:00" });
    const [keep, remove] = facade.getViewings(1);
    await render();
    fixture.nativeElement.querySelectorAll(".viewing-log__delete button")[1].click();
    expect(openConfirmation).toHaveBeenCalledWith(
      ConfirmModal,
      expect.objectContaining({
        data: expect.objectContaining({ message: expect.stringContaining("21:00") }),
      }),
    );
    expect(facade.getViewings(1)).toHaveLength(2);
    confirmation.next(true);
    confirmation.complete();
    await fixture.whenStable();
    expect(facade.getViewings(1)).toEqual([keep]);
    expect(facade.getViewings(1).some((item) => item.id === remove.id)).toBe(false);
    expect(fixture.nativeElement.querySelectorAll(".viewing-log__viewing")).toHaveLength(1);
  });

  it("keeps the viewing when deletion is cancelled", async () => {
    facade.addViewing(1, entry);
    const before = [...facade.getViewings(1)];
    await render();
    fixture.nativeElement.querySelector(".viewing-log__delete button").click();
    confirmation.next(false);
    confirmation.complete();
    await fixture.whenStable();
    expect(facade.getViewings(1)).toEqual(before);
    expect(fixture.nativeElement.querySelectorAll(".viewing-log__viewing")).toHaveLength(1);
  });
});
