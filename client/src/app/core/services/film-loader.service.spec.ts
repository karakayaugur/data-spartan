import { ApplicationInitStatus, inject, provideAppInitializer } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { provideHttpClient } from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { globalCacheBusterNotifier } from "ts-cacheable";
import { FilmStoreService, FILMS_STORAGE_KEY } from "@core/store";
import { FilmLoaderService } from "./film-loader.service";

describe("Film startup loading", () => {
  beforeEach(() => {
    globalCacheBusterNotifier.next();
    sessionStorage.removeItem(FILMS_STORAGE_KEY);
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideAppInitializer(() => inject(FilmLoaderService).load()),
      ],
    });
  });
  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
    sessionStorage.removeItem(FILMS_STORAGE_KEY);
  });

  it("fetches and stores films before application initialization completes", async () => {
    const status = TestBed.inject(ApplicationInitStatus);
    const loader = TestBed.inject(FilmLoaderService);
    const startup = status.donePromise;
    const films = [{ id: 1, title: "A New Hope", episodeId: 4, releaseDate: "1977-05-25" }];
    const concurrent = loader.load();
    TestBed.inject(HttpTestingController).expectOne("/proxyUrl/films").flush(films);
    await startup;
    await concurrent;
    expect(TestBed.inject(FilmStoreService).films()).toEqual(films);
    expect(loader.loading()).toBeFalse();
  });

  it("allows startup after a failure and supports retry", async () => {
    const status = TestBed.inject(ApplicationInitStatus);
    const loader = TestBed.inject(FilmLoaderService);
    const http = TestBed.inject(HttpTestingController);
    const startup = status.donePromise;
    http.expectOne("/proxyUrl/films").flush({}, { status: 500, statusText: "Failed" });
    await startup;
    expect(loader.failed()).toBeTrue();
    const retry = loader.load();
    http.expectOne("/proxyUrl/films").flush([]);
    await retry;
    expect(loader.failed()).toBeFalse();
  });
});
