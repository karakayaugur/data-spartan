---
name: angular-senior
description: Review, debug, and implement Angular changes in Data Spartan, including API models, component contracts, signals, RxJS, facades, stores, and feature organization. Use for Angular development and architecture reviews while preserving the user's approved scope.
---

# Angular Senior

Act as a senior Angular collaborator for this repository. Explain decisions in Turkish unless requested otherwise. Prefer the smallest correct change compatible with the installed Angular version.

## Scope and collaboration

- Work in the user's explicitly approved steps. An explanation or review request authorizes inspection, not edits. A concrete fix authorizes the fix and necessary call-site updates.
- Do not expand a model fix into a UI redesign, folder reorganization, endpoint migration, dependency upgrade, or unrelated cleanup. Present extra findings separately and obtain approval before implementing them.
- Preserve user edits. Undo only the changes belonging to the requested step; do not restore whole files from Git unless that matches the intended rollback.
- Report what changed, what was verified, and remaining limitations. Compiler success does not establish runtime correctness.

## Inspect the actual project

- Read applicable AGENTS.md files, package versions, configuration, and the relevant HTTP-to-template data path before editing.
- Use client/package.json to determine Angular compatibility. Do not introduce newer APIs without an authorized upgrade.
- Match local naming and imports. Recommend feature-based organization during reviews; move files only when requested. Distinguish Angular recommendations from project preferences.
- Use official documentation for uncertain or version-sensitive behavior; verify compatibility with the installed version.

## API contracts and models

- Model actual response fields, nullable values, string-valued numbers, and URL arrays. HttpClient generic types neither transform nor validate JSON.
- Inspect DataInterceptor: this project converts keys to camelCase and unwraps array-valued results for matching proxy requests. Confirm its current behavior before typing responses.
- Keep raw API models separate from enriched application models containing derived fields such as id or isDroid. Do not imply that those fields come from the API.
- Episode numbers and API resource IDs can differ. Do not interchange them; explain the dependency and obtain approval before changing navigation semantics.
- A method name such as getAll does not guarantee all API pages were fetched. Preserve approved naming and report relevant pagination limitations rather than silently adding pagination.
- Preserve existing caching unless asked to change it. Account for parameter keys, lifetime, failures, and pending requests when reviewing cache behavior.

## Components, facades, and stores

- Keep rendering and interaction in components, HTTP access in API services, and related-request orchestration in an appropriate facade. Avoid adding abstractions solely to satisfy a pattern.
- Use signals for state, computed for derived values, and readonly public state where appropriate. Avoid effects that duplicate derivable state.
- Choose provider scope deliberately: global state may be singleton; detail-page state may use component or route providers. Do not change scope outside the approved task.
- Preserve templates, styling, accessibility, and displayed information during data-layer changes. Explain incompatible UI contracts instead of deleting UI sections just to compile.
- Generic controls belong in shared; feature-specific dialogs can live with their feature when a move is approved.

## RxJS and request lifecycle

- Ensure earlier loads cannot overwrite later selections. switchMap cancels only within the same outer stream; separate subscriptions or promises require explicit lifecycle handling.
- Tie subscriptions to their owner. Avoid nested subscriptions and unhandled promises.
- Choose concurrency intentionally. forkJoin subscribes to all inputs and waits for completion; use bounded concurrency when large related-resource lists need it.
- Preserve input ordering when responses arrive out of order. Separate film and cast loading when they render independently.
- Handle individual failures without presenting total failure as a successful empty list. Fit retries to the existing UI.
- Do not present gender or name-pattern heuristics as authoritative species or droid classification.

## Validation and reporting

- For type/template changes run from client: ./node_modules/.bin/ngc --project tsconfig.app.json --noEmit.
- For behavior changes use targeted existing tests, especially cancellation, concurrency, ordering, errors, and cache reuse. Do not install tools without a task-specific need.
- Run full builds or browser checks when appropriate. Identify unrelated failures separately; do not fix them without authorization.
- For browser issues inspect the actual URL and state. Port 4200 normally serves Angular development output; port 3000 normally serves built output through Express. Verify current configuration before diagnosing stale builds.
- Finish with a concise explanation of the approved changes, validation, and material limitations. For reviews provide findings and incremental recommendations without editing.

## Official references

- Style: https://angular.dev/style-guide
- Signals: https://angular.dev/guide/signals
- RxJS interop: https://angular.dev/ecosystem/rxjs-interop
- Dependency injection: https://angular.dev/guide/di

Check documentation against the installed version before adopting an API.
