import { expect, test } from "@playwright/test";

// Synthetic film data keeps the application flow independent of upstream film numbering.
const film = {
  title: "The Test Adventure",
  episode_id: 1,
  release_date: "1977-05-25",
  opening_crawl: "A deterministic adventure for the end-to-end test.",
  director: "Test Director",
  producer: "Test Producer",
  characters: ["https://swapi.dev/api/people/2/", "https://swapi.dev/api/people/1/"],
  planets: [],
  species: [],
  starships: [],
  vehicles: [],
  created: "",
  edited: "",
  url: "https://swapi.dev/api/films/1/",
};
const person = {
  name: "Luke Skywalker",
  height: "172",
  mass: "77",
  birth_year: "19BBY",
  gender: "male",
  hair_color: "blond",
  skin_color: "fair",
  eye_color: "blue",
  homeworld: "https://swapi.dev/api/planets/1/",
  species: ["https://swapi.dev/api/species/1/"],
  films: [],
  vehicles: [],
  starships: [],
  created: "",
  edited: "",
  url: "https://swapi.dev/api/people/1/",
};

test("browses a film, distinguishes cast details, and adds then deletes a viewing", async ({
  page,
}) => {
  const unexpectedRequests: string[] = [];
  const pageErrors: string[] = [];
  const detailRequests: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.clock.setFixedTime(new Date("2026-01-15T12:00:00Z"));
  const responses: Record<string, unknown> = {
    "/films": { count: 1, next: null, previous: null, results: [film] },
    "/films/1": film,
    "/people/1": person,
    "/people/2": {
      ...person,
      name: "C-3PO",
      height: "167",
      mass: "75",
      birth_year: "112BBY",
      gender: "n/a",
      species: ["https://swapi.dev/api/species/2/"],
      url: "https://swapi.dev/api/people/2/",
    },
    "/species/1": {
      name: "Human",
      classification: "mammal",
      url: "https://swapi.dev/api/species/1/",
    },
    "/planets/1": { name: "Tatooine", url: "https://swapi.dev/api/planets/1/" },
  };
  await page.route("**/proxyUrl/**", async (route) => {
    const path = new URL(route.request().url()).pathname
      .replace(/^\/proxyUrl/, "")
      .replace(/\/$/, "");
    if (/^\/(species|planets)\//.test(path)) detailRequests.push(path);
    if (!(path in responses)) {
      unexpectedRequests.push(path);
      await route.fulfill({ status: 500, json: { message: "Unexpected E2E API request" } });
      return;
    }
    await route.fulfill({ json: responses[path] });
  });

  await test.step("Open a film from the list", async () => {
    await page.goto("/films");
    await expect(page.getByRole("heading", { name: "Explore the films" })).toBeVisible();
    await page
      .getByRole("navigation", { name: "Choose a film" })
      .getByRole("link", { name: /The Test Adventure/ })
      .click();
    await expect(page).toHaveURL(/\/films\/1$/);
    await expect(
      page.getByRole("heading", { name: "1 - The Test Adventure", exact: true }),
    ).toBeVisible();
  });

  const panel = page.locator("app-character-panel");
  await test.step("Show robot information without species or homeworld requests", async () => {
    await page.getByRole("button", { name: "C-3PO", exact: true }).click();
    await expect(panel.getByText("Artificial being", { exact: true })).toBeVisible();
    await expect(panel.getByText("167 cm", { exact: true })).toBeVisible();
    await expect(panel.getByText("75 kg", { exact: true })).toBeVisible();
    await expect(panel.getByText("Manufacturing year", { exact: true })).toBeVisible();
    await expect(panel.getByText("112BBY", { exact: true })).toBeVisible();
    expect(detailRequests).toEqual([]);
  });

  await test.step("Show an organic character's species and homeworld", async () => {
    await page.getByRole("button", { name: "Luke Skywalker", exact: true }).click();
    for (const value of ["Human", "mammal", "Tatooine", "172 cm", "19BBY"]) {
      await expect(panel.getByText(value, { exact: true })).toBeVisible();
    }
    await expect(panel.getByText("Artificial being", { exact: true })).toHaveCount(0);
    await expect(panel.getByText("Manufacturing year", { exact: true })).toHaveCount(0);
  });

  await test.step("Add a viewing using the real date and time controls", async () => {
    await page
      .getByRole("button", { name: "Open viewing log for The Test Adventure, watched 0 times" })
      .click();
    const dialog = page.getByRole("dialog", { name: "The Test Adventure", exact: true });
    await dialog.getByRole("button", { name: "Choose Date", exact: true }).click();
    await page.locator(".flatpickr-day.today").click();
    await expect(dialog.getByRole("textbox", { name: "Date", exact: true })).toHaveValue(
      "2026-01-15",
    );
    await dialog.getByRole("button", { name: "Choose Time", exact: true }).click();
    const time = page.getByRole("dialog", { name: "Choose Time", exact: true });
    await time
      .getByRole("group", { name: "Hour", exact: true })
      .getByRole("button", { name: "20", exact: true })
      .click();
    await time
      .getByRole("group", { name: "Minute", exact: true })
      .getByRole("button", { name: "30", exact: true })
      .click();
    await time.getByRole("button", { name: "Apply", exact: true }).click();
    await dialog.getByRole("textbox", { name: "Description", exact: true }).fill("E2E viewing");
    await dialog.getByRole("button", { name: "Add viewing", exact: true }).click();
    await expect(
      dialog.getByRole("heading", { name: "Recorded viewings (1)", exact: true }),
    ).toBeVisible();
    await expect(dialog.getByText("E2E viewing", { exact: true })).toBeVisible();
    await expect(dialog.getByRole("textbox", { name: "Date", exact: true })).toHaveValue("");
  });

  await test.step("Confirm deletion and update the film viewing count", async () => {
    const dialog = page.getByRole("dialog", { name: "The Test Adventure", exact: true });
    await dialog
      .getByRole("button", { name: "Delete viewing on 2026-01-15 at 20:30", exact: true })
      .click();
    const confirmation = page.getByRole("alertdialog", { name: "Delete viewing?", exact: true });
    await confirmation.getByRole("button", { name: "Delete", exact: true }).click();
    await expect(confirmation).toHaveCount(0);
    await expect(dialog.getByText("E2E viewing", { exact: true })).toHaveCount(0);
    await expect(dialog.getByRole("heading", { name: /Recorded viewings/ })).toHaveCount(0);
    await dialog.getByRole("button", { name: "Close modal", exact: true }).click();
    await expect(
      page.getByRole("button", {
        name: "Open viewing log for The Test Adventure, watched 0 times",
      }),
    ).toBeVisible();
  });
  expect(unexpectedRequests).toEqual([]);
  expect(pageErrors).toEqual([]);
});
