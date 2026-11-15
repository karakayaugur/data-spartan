# Star Wars API proxy

Angular → ApiService → Express `/proxyUrl` → SWAPI.

Express forwards requests under `/proxyUrl` to `SWAPI_BASE_URL` (default `https://swapi.dev/api/`). The proxy preserves the request method, path, query and body, and returns the upstream status, headers and body. It has no SWAPI resource validation, model conversion or server cache. The upstream host is configured on the server; callers cannot choose it.

Model conversion lives in Angular `FilmService` and `CharacterService`. FilmService maps snake_case fields, sorts films by episode and returns character URLs unchanged without fetching cast members. CharacterService resolves species and homeworld, classifies Droid/artificial species as robots and uses `birth_year` as manufacturingYear. Missing species remain empty and missing homeworld is Unknown. UI models and viewing history are unchanged.

SwapiService resolves upstream resource links through the local proxy and caches resources for five minutes on the client. The proxy has a 15-second upstream timeout.

Upstream error responses pass through unchanged. Proxy connection failures return 502 with `{ message: "Unable to reach the upstream API" }`. HTTP logging and POST `/proxyUrl/error` client error reporting remain in place. The Angular HTTP interceptor displays error toasts; unexpected client errors are reported separately.

Viewing history remains in sessionStorage under `data-spartan.films` for the browser tab session.

Proxy configuration lives directly in `server/index.js`. HTTP logging and client error reporting live under `server/middlewares/`.

Validation: `npm test`, `npm run build`.
