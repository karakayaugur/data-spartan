# Data Spartan

An Angular 20 + Express 5 project based on the structure of `fe-berlin-admin`. It uses Node.js 24 and retains the original project's package versions and lockfiles.

```text
client/
  src/app/
    core/        # HTTP services, interceptors, guards, services, and signal stores
    shared/      # Reusable UI, filters, tables, pipes, directives, and validators
    layouts/     # Application and overlay layouts
    pages/       # Routed pages
  src/assets/    # Fonts, icons, images, translations, and styles
  public/        # Public static files
server/
  index.js       # Express, Helmet, health checks, and SPA hosting
  routes/        # BFF endpoints and client error reporting
  lib/           # HTTP logger
deployment/      # Docker Compose configuration
docs/            # Architecture notes
```

## Development

```sh
npm run install-packages
cp .env.example .env
npm run dev
```

Client: http://localhost:4200 — Express: http://localhost:3000

The Angular development server forwards `/proxyUrl` requests to the Express BFF. Express uses `SWAPI_BASE_URL`, which defaults to `https://swapi.dev/api/`. Angular does not access the external API directly. See `docs/bff.md` for the BFF endpoints and response contracts.

## Validation and production

```sh
npm run build
npm test
npm run test:server
npm start
```

`npm test` requires Chrome or Chromium. `npm start` serves the compiled client on port 3000. The health check is available at `/health`. For Docker, use `make build` and `make run`. Docker Compose reads the upstream API address from the `SWAPI_BASE_URL` environment variable.

## Formatting

Git commits automatically format staged source files with Prettier through Husky and lint-staged. Hooks are installed by the root `npm install` / `npm ci` prepare script. A formatting failure stops the commit.

Run `npm run format` to format the project, or `npm run format:check` to check formatting without changing files.

## Project foundations

The project retains the original layered architecture, TypeScript aliases (`@core`, `@shared`, `@app`), separate HTML and CSS files, signal-based UI, theme and locale stores, style tokens, shared components, and BFF structure. Form conventions are documented in `.instructions.md`.

This project started as a clean foundation. Berlin's payment, banking, and merchant screens, their API services, and API-specific selection components were not copied. Authentication has not been implemented, so the dashboard is publicly accessible. Authentication guards and HTTP interceptors can be added through the core layers. Berlin's `.env`, Git history, agent/editor settings, and production AWS deployment targets were not copied. Local Docker Compose configuration is provided instead.

## Film browsing and viewing history

The sidebar lists films and provides a separate viewing history action for each film. Selecting a film displays its title and opening crawl above the cast list. The selected character's details appear beside the cast list. On smaller screens, the cast and character panels are stacked vertically.

The sidebar is a separate component under `layouts/app/sidebar`. It has a fixed width of 256px on desktop, with no collapse or icon-rail mode. At widths of 640px and below, a hamburger button opens a full-width mobile panel. The close button, Escape key, film selection, or switching to desktop closes the panel. Keyboard focus stays inside the mobile panel while it is open. Film navigation, viewing history actions, and theme controls share the same sidebar component. The visual reference is implemented with Angular and CSS; React and Tailwind are not used.

The viewing history modal requires a date and time; the description is optional. Multiple entries can be added for the same film, listed when the modal is reopened, and deleted individually. Each film has its own history. Entries are stored together with the film list in `sessionStorage` under the `data-spartan.films` key and restored after a page reload. They last for the browser tab's session and are not sent to the BFF.

SWAPI does not provide a separate manufacturing year for robots, so `birth_year` is displayed as the manufacturing year. Characters without species links display `Unknown` for species and classification; missing data is not inferred. The layout follows the exercise's wireframes while using the project's theme and style tokens.

## Film state management

State management follows the reference project's AuthStore pattern. `core/store/films/films.store.ts` manages signal state, the `setState` / `patchState` / `clearState` operations, and synchronization with `sessionStorage`.

`FilmsService` in `films.services.ts` provides methods to read and update the film list and viewing history. The initial HTTP response populates the film list in the store. Modal entries update the same state's `viewings[filmId]` field. An `effect` persists state changes, and refreshing the film list preserves viewing history.
