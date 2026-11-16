import { signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { of, Subject, throwError } from "rxjs";
import { Person, Planet, PlanetService, Specie, SpecieService } from "@core/http";
import { CastListFacade } from "../cast-list/cast-list.facade";
import { CharacterDetailFacade } from "./character-detail.facade";

const person: Person = {
  id: 1,
  name: "Luke",
  height: "172",
  mass: "77",
  birthYear: "19BBY",
  gender: "male",
  hairColor: "blond",
  skinColor: "fair",
  eyeColor: "blue",
  homeworld: "https://swapi.dev/api/planets/1/",
  species: ["https://swapi.dev/api/species/1/"],
  films: [],
  vehicles: [],
  starships: [],
  created: "",
  edited: "",
  url: "https://swapi.dev/api/people/1/",
  isDroid: false,
};
const planet = { name: "Tatooine" } as Planet;
const specie = {
  name: "Human",
  classification: "mammal",
  url: "https://swapi.dev/api/species/1/",
} as Specie;

describe("CharacterDetailFacade", () => {
  const selected = signal<Person | null>(null);
  let planets: jasmine.SpyObj<PlanetService>;
  let species: jasmine.SpyObj<SpecieService>;
  let facade: CharacterDetailFacade;

  beforeEach(() => {
    selected.set(null);
    planets = jasmine.createSpyObj("PlanetService", ["getById"]);
    species = jasmine.createSpyObj("SpecieService", ["getById"]);
    TestBed.configureTestingModule({
      providers: [
        CharacterDetailFacade,
        { provide: CastListFacade, useValue: { selectedCharacter: selected } },
        { provide: PlanetService, useValue: planets },
        { provide: SpecieService, useValue: species },
      ],
    });
    facade = TestBed.inject(CharacterDetailFacade);
  });

  it("uses the selected droid without making extra API requests", () => {
    selected.set({ ...person, isDroid: true });
    TestBed.flushEffects();
    expect(facade.character()?.isDroid).toBeTrue();
    expect(planets.getById).not.toHaveBeenCalled();
    expect(species.getById).not.toHaveBeenCalled();
  });

  it("fetches species and homeworld names for non-robots", () => {
    planets.getById.and.returnValue(of(planet));
    species.getById.and.returnValue(of(specie));
    selected.set(person);
    TestBed.flushEffects();
    expect(facade.homeworldName()).toBe("Tatooine");
    expect(facade.species()[0].classification).toBe("mammal");
    expect(facade.loading()).toBeFalse();
  });

  it("cancels old detail requests when selection changes", () => {
    const pending = new Subject<Planet>();
    planets.getById.and.returnValue(pending);
    species.getById.and.returnValue(of(specie));
    selected.set(person);
    TestBed.flushEffects();
    expect(pending.observed).toBeTrue();
    selected.set({ ...person, id: 2, isDroid: true });
    TestBed.flushEffects();
    expect(pending.observed).toBeFalse();
    expect(facade.homeworldName()).toBeNull();
  });

  it("supports empty species and retries failed homeworld requests", () => {
    planets.getById.and.returnValues(
      throwError(() => new Error("Unavailable")),
      of(planet),
    );
    selected.set({ ...person, species: [] });
    TestBed.flushEffects();
    expect(facade.error()).toBeTrue();
    facade.retry();
    expect(facade.error()).toBeFalse();
    expect(facade.homeworldName()).toBe("Tatooine");
    expect(facade.species()).toEqual([]);
    expect(species.getById).not.toHaveBeenCalled();
  });
});
