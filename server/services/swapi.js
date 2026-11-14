export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function createSwapiService({ baseUrl = "https://swapi.dev/api/", fetchImpl = fetch } = {}) {
  const base = new URL(baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`);
  const cache = new Map();

  // Follow only known SWAPI resource paths, always on the configured upstream.
  function resourcePath(value) {
    const path = /^https?:\/\//.test(value)
      ? new URL(value).pathname.replace(/^\/api\//, "")
      : value;
    if (!/^(films|people|species|planets)\/(?:[1-9]\d*\/)?$/.test(path)) {
      throw new ApiError(502, "Invalid upstream resource");
    }
    return path;
  }

  async function get(value) {
    const path = resourcePath(value);
    const cached = cache.get(path);
    if (cached && cached.expires > Date.now()) return cached.promise;
    const entry = { expires: Date.now() + 300_000 };
    entry.promise = (async () => {
      try {
        const response = await fetchImpl(new URL(path, base), {
          headers: { Accept: "application/json" },
          signal: AbortSignal.timeout(15_000),
        });
        if (!response.ok)
          throw new ApiError(
            response.status === 404 ? 404 : 502,
            response.status === 404 ? "Resource not found" : "SWAPI request failed",
          );
        return await response.json();
      } catch (error) {
        if (cache.get(path) === entry) cache.delete(path);
        if (error instanceof ApiError) throw error;
        throw new ApiError(
          error.name === "TimeoutError" ? 504 : 502,
          "SWAPI is temporarily unavailable",
        );
      }
    })();
    cache.set(path, entry);
    return entry.promise;
  }

  const idFrom = (url) => Number(resourcePath(url).split("/")[1]);
  const filmSummary = (film) => ({
    id: idFrom(film.url),
    title: film.title,
    episodeId: film.episode_id,
    releaseDate: film.release_date,
  });

  return {
    async getFilms() {
      const data = await get("films/");
      return data.results.map(filmSummary).sort((a, b) => a.episodeId - b.episodeId);
    },
    async getFilm(id) {
      const film = await get(`films/${id}/`);
      // Bounded batches avoid firing an entire cast's requests simultaneously.
      const cast = [];
      for (let offset = 0; offset < film.characters.length; offset += 6) {
        const batch = await Promise.all(film.characters.slice(offset, offset + 6).map(get));
        cast.push(...batch.map((person) => ({ id: idFrom(person.url), name: person.name })));
      }
      return {
        ...filmSummary(film),
        openingCrawl: film.opening_crawl,
        director: film.director,
        cast,
      };
    },
    async getCharacter(id) {
      const person = await get(`people/${id}/`);
      const species = await Promise.all(person.species.map(get));
      const common = { id: idFrom(person.url), name: person.name, height: person.height };
      if (
        species.some(
          (item) =>
            item.classification?.toLowerCase() === "artificial" ||
            item.name?.toLowerCase() === "droid",
        )
      ) {
        return {
          ...common,
          kind: "robot",
          mass: person.mass,
          manufacturingYear: person.birth_year,
        };
      }
      const homeworld = person.homeworld ? await get(person.homeworld) : null;
      return {
        ...common,
        kind: "organic",
        birthYear: person.birth_year,
        homeworld: homeworld?.name ?? "Unknown",
        species: species.map((item) => ({ name: item.name, classification: item.classification })),
      };
    },
  };
}
