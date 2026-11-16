# Data Spartan

Live application: [Data Spartan](http://ec2-34-246-168-123.eu-west-1.compute.amazonaws.com/)

A Star Wars film browser built with Angular 21 (zoneless), Express 5, and Node.js 24. Browse films and characters from SWAPI, record viewing history, and switch between light and dark themes.

```text
client/
  src/app/
    core/        # HTTP services, interceptors, guards, services, and signal stores
    shared/      # Reusable UI, filters, tables, pipes, directives, and validators
    layouts/     # Application and overlay layouts
    pages/       # Routed pages
  src/assets/    # Fonts, icons, images, and styles
  public/        # Public static files
server/
  index.js       # API proxy, Helmet, health check, and SPA hosting
  middlewares/   # HTTP logger and client error reporting
deployment/      # Docker Compose configuration
```

## Development

Use Node.js 24 and run commands from the repository root:

```sh
npm run dev
```

The `predev` step installs root, client, and server dependencies using their lockfiles. To override the default port or SWAPI URL, copy `.env.example` to `.env` before starting.

Client: http://localhost:4200 — Express: http://localhost:3000

The Angular development server forwards `/proxyUrl` requests to the Express proxy. Express uses `SWAPI_BASE_URL`, which defaults to `https://swapi.dev/api/`. Angular does not access the external API directly.

## Validation and production

Install dependencies before building or testing:

```sh
npm run install-packages
npm run build
npm test
npm start
```

`npm test` uses Vitest with jsdom; Chrome or Chromium is not required. Tests are discovered from `*.spec.ts` and `*.test.ts` files. If no test files exist, the Angular test builder reports that no tests were found. `npm start` serves the compiled client on port 3000. The health check is available at `/health`. For Docker, use `make build` and `make run`. Docker Compose reads the upstream API address from the `SWAPI_BASE_URL` environment variable.

## End-to-end test

Install Chromium once, then run the Playwright scenario from the repository root:

```sh
npm --prefix client exec -- playwright install chromium
npm run test:e2e
```

The test starts an isolated Angular dev server on port 4300 and mocks API responses, so Express and SWAPI are not required. It covers film navigation, robot and non-robot details, and adding/deleting a viewing through the real date/time controls. Fixtures are synthetic and do not validate SWAPI's film ID/episode numbering. The HTML report is generated in `client/playwright-report/`; failed runs retain a trace and screenshot in `client/test-results/`.

## Docker

With Docker installed and running, execute these commands from the repository root. Node.js and npm are not required on the host; dependencies are installed and Angular is compiled inside the Docker build. The default SWAPI URL is configured, so a `.env` file is optional.

Build and start the application at http://localhost:3000:

```sh
docker compose -f deployment/compose.prod.yml up -d --build
```

Follow application logs:

```sh
docker compose -f deployment/compose.prod.yml logs -f
```

Stop and remove the containers:

```sh
docker compose -f deployment/compose.prod.yml down
```

Make shortcuts are also available: `make build`, `make run`, `make logs`, `make stop`, and `make health`.

## Formatting

Git commits automatically format staged source files with Prettier through Husky and lint-staged. Hooks are installed by the root `npm install` / `npm ci` prepare script. A formatting failure stops the commit.

Run `npm run format` to format the project, or `npm run format:check` to check formatting without changing files.

## Application architecture

Angular uses TypeScript aliases (`@core`, `@shared`, `@app`), separate HTML and SCSS templates, signals, shared components, and a theme store. Form conventions are documented in `.instructions.md`.

Express forwards `/proxyUrl` requests to SWAPI, serves the compiled Angular application, provides `/health`, and logs HTTP requests and client error reports. Model conversion, related-resource loading, and caching are handled by Angular services. Client errors are reported to `POST /proxyUrl/error`; HTTP failures are displayed through the notification service.

Authentication is not implemented; application routes are publicly accessible.

## Film browsing and viewing history

The sidebar lists films and provides a separate viewing history action for each film. Selecting a film displays its title and opening crawl above the cast list. The selected character's details appear beside the cast list. On smaller screens, the cast and character panels are stacked vertically.

The sidebar is a separate component under `layouts/app/sidebar`. It has a fixed width of 256px on desktop, with no collapse or icon-rail mode. At widths of 640px and below, a hamburger button opens a full-width mobile panel. The close button, Escape key, film selection, or switching to desktop closes the panel. Keyboard focus stays inside the mobile panel while it is open. Film navigation, viewing history actions, and theme controls share the same sidebar component.

The viewing history modal requires a date and time; the description is optional. Multiple entries can be added for the same film, listed when the modal is reopened, and deleted individually. Each film has its own history. Entries are stored together with the film list in `sessionStorage` under the `data-spartan.films` key and restored after a page reload. They last for the browser tab's session and remain in the browser.

SWAPI does not provide a separate manufacturing year for robots, so `birth_year` is displayed as the manufacturing year. Characters without species links display `Unknown` for species and classification; missing data is not inferred.

## Film state management

`FilmStore` in `core/store/film/film.store.ts` manages signal state, the `setState` / `patchState` / `clearState` operations, and synchronization with `sessionStorage`.

`FilmFacade` in `core/store/film/film.facade.ts` provides methods to read and update the film list and viewing history. The initial HTTP response populates the film list in the store. Modal entries update the same state's `viewings[filmId]` field. An `effect` persists state changes, and refreshing the film list preserves viewing history.

## Styling architecture

Application styles use SCSS and component-scoped BEM names: `block__element` and `block__element--state`. Keep nesting shallow and preserve framework-owned classes.

- `assets/styles/tokens/`: Open Props and primitive tokens.
- `assets/styles/theme/`: runtime light/dark CSS custom properties.
- `assets/styles/base/`: reset, fonts and typography.
- `assets/styles/abstracts/`: CSS-free Sass helpers. Use `@use "abstracts/breakpoints"` and `@include breakpoints.up(tablet)` for responsive component rules.
- Component SCSS files own their layout and visual styles. Theme values remain `var(--brand)`, `var(--surface-1)`, etc., so theme changes work at runtime.

Angular CLI generates SCSS for new components by default.

Responsive styles use a mobile-first approach: base rules target small screens, with `breakpoints.up(...)` adding wider layouts (tablet: 641px, laptop: 1024px). Keep motion and theme preference queries separate from viewport breakpoints.

## Storybook

Run `npm run storybook` from the repository root to open the shared UI catalog at http://localhost:6006. The Express server does not need to be running.

The command first installs the client dependencies, including development dependencies, using `npm ci --include=dev`. It works from a fresh clone without a separate installation step. This installation runs on every invocation and requires access to the npm registry. `npm run build-storybook` uses the same installation step. Node.js 24 is recommended.

The toolbar switches between light and dark themes using the application's real theme tokens. Stories cover Button, Badge, Date, Time, Textarea, validation feedback, and the shared modal opened through `ModalService`. Controls expose component inputs; the accessibility panel provides manual accessibility checks.

Run `npm run build-storybook` to generate a standalone catalog in `client/storybook-static/`. Story files live beside components and are excluded from the application build.
