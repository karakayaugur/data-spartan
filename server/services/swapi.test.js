import { test } from "node:test";
import assert from "node:assert/strict";
import { createSwapiService } from "./swapi.js";

const film = {
  url: "https://swapi.dev/api/films/1/",
  title: "A New Hope",
  episode_id: 4,
  release_date: "1977-05-25",
  opening_crawl: "A long time ago",
  director: "George Lucas",
  characters: ["https://swapi.dev/api/people/1/", "https://swapi.dev/api/people/2/"],
};
const fixtures = {
  "films/": { results: [film] },
  "films/1/": film,
  "people/1/": {
    url: "https://swapi.dev/api/people/1/",
    name: "Luke",
    height: "172",
    birth_year: "19BBY",
    species: ["https://swapi.dev/api/species/1/"],
    homeworld: "https://swapi.dev/api/planets/1/",
  },
  "people/2/": {
    url: "https://swapi.dev/api/people/2/",
    name: "C-3PO",
    height: "167",
    mass: "75",
    birth_year: "112BBY",
    species: ["https://swapi.dev/api/species/2/"],
  },
  "species/1/": { name: "Human", classification: "mammal" },
  "species/2/": { name: "Droid", classification: "artificial" },
  "planets/1/": { name: "Tatooine" },
};
function setup() {
  const calls = [];
  const service = createSwapiService({
    baseUrl: "https://example.test/api/",
    fetchImpl: async (url) => {
      calls.push(url.href);
      const data = fixtures[url.pathname.replace("/api/", "")];
      return new Response(JSON.stringify(data ?? {}), { status: data ? 200 : 404 });
    },
  });
  return { service, calls };
}

test("lists films and resolves complete cast on configured upstream, deduplicating requests", async () => {
  const { service, calls } = setup();
  assert.deepEqual(await service.getFilms(), [
    { id: 1, title: "A New Hope", episodeId: 4, releaseDate: "1977-05-25" },
  ]);
  const [first, second] = await Promise.all([service.getFilm(1), service.getFilm(1)]);
  assert.deepEqual(first, second);
  assert.deepEqual(first.cast, [
    { id: 1, name: "Luke" },
    { id: 2, name: "C-3PO" },
  ]);
  assert.equal(calls.length, 4);
  assert.ok(calls.every((url) => url.startsWith("https://example.test/api/")));
});

test("returns different robot and organic contracts", async () => {
  const { service } = setup();
  const robot = await service.getCharacter(2);
  assert.equal(robot.kind, "robot");
  assert.equal(robot.manufacturingYear, "112BBY");
  assert.equal(robot.mass, "75");
  assert.equal("birthYear" in robot, false);
  const organic = await service.getCharacter(1);
  assert.equal(organic.kind, "organic");
  assert.equal(organic.homeworld, "Tatooine");
  assert.deepEqual(organic.species, [{ name: "Human", classification: "mammal" }]);
});

test("propagates missing resources and does not cache failed requests", async () => {
  const { service, calls } = setup();
  for (let i = 0; i < 2; i++) await assert.rejects(service.getFilm(999), { status: 404 });
  assert.equal(calls.length, 2);
});

test("maps network failure to a controlled upstream error", async () => {
  const service = createSwapiService({
    fetchImpl: async () => {
      throw new TypeError("private network details");
    },
  });
  await assert.rejects(service.getFilms(), {
    status: 502,
    message: "SWAPI is temporarily unavailable",
  });
});

test("rejects traversal instead of fetching arbitrary upstream paths", async () => {
  const { service, calls } = setup();
  await assert.rejects(service.getFilm("../people/1"), { status: 502 });
  assert.equal(calls.length, 0);
});
