import { provideHttpClient } from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { firstValueFrom } from "rxjs";
import { globalCacheBusterNotifier } from "ts-cacheable";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { Planet } from "./planet.interface";
import { PlanetService } from "./planet.service";

const tatooine: Planet = {
  name: "Tatooine",
  rotationPeriod: "23",
  orbitalPeriod: "304",
  diameter: "10465",
  climate: "arid",
  gravity: "1 standard",
  terrain: "desert",
  surfaceWater: "1",
  population: "200000",
  residents: [],
  films: ["https://swapi.dev/api/films/1/"],
  created: "2014-12-09T13:50:49.641000Z",
  edited: "2014-12-20T20:58:18.411000Z",
  url: "https://swapi.dev/api/planets/1/",
};
const alderaan: Planet = {
  ...tatooine,
  name: "Alderaan",
  url: "https://swapi.dev/api/planets/2/",
};

describe("PlanetService caching", () => {
  let service: PlanetService;
  let http: HttpTestingController;

  beforeEach(() => {
    globalCacheBusterNotifier.next();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(PlanetService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    try {
      http.verify();
    } finally {
      globalCacheBusterNotifier.next();
    }
  });

  it("returns the cached planet without another HTTP request for the same ID", async () => {
    const first = firstValueFrom(service.getById(1));
    const request = http.expectOne("/proxyUrl/planets/1");
    expect(request.request.method).toBe("GET");
    request.flush(tatooine);
    expect(await first).toEqual(tatooine);

    const second = firstValueFrom(service.getById(1));
    http.expectNone("/proxyUrl/planets/1");
    expect(await second).toEqual(tatooine);
  });

  it("fetches a different ID and reuses the original planet in an A → B → A sequence", async () => {
    const first = firstValueFrom(service.getById(1));
    http.expectOne("/proxyUrl/planets/1").flush(tatooine);
    await first;

    const different = firstValueFrom(service.getById(2));
    http.expectOne("/proxyUrl/planets/2").flush(alderaan);
    expect(await different).toEqual(alderaan);

    const original = firstValueFrom(service.getById(1));
    http.expectNone("/proxyUrl/planets/1");
    expect(await original).toEqual(tatooine);
  });

  it("does not cache failed responses and allows a new request on retry", async () => {
    const failed = firstValueFrom(service.getById(1));
    const rejection = expect(failed).rejects.toMatchObject({ status: 503 });
    http.expectOne("/proxyUrl/planets/1").flush("Unavailable", {
      status: 503,
      statusText: "Service Unavailable",
    });
    await rejection;

    const retry = firstValueFrom(service.getById(1));
    http.expectOne("/proxyUrl/planets/1").flush(tatooine);
    expect(await retry).toEqual(tatooine);
  });
});
