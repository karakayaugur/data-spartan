import { TestBed } from "@angular/core/testing";
import { provideHttpClient } from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { ApiService } from "./api.service";

describe("ApiService", () => {
  let api: ApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(ApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it("passes query parameters and headers and returns the response unchanged", () => {
    const response = { data: { items: [{ id: 11 }] } };
    api
      .get<typeof response>("/items", {
        params: { active: true },
        headers: { "X-Request-ID": "test" },
      })
      .subscribe((result) => expect(result).toEqual(response));
    const req = http.expectOne("/proxyUrl/items?active=true");
    expect(req.request.headers.get("X-Request-ID")).toBe("test");
    expect(req.request.headers.has("page")).toBeFalse();
    req.flush(response, { headers: { total_count: "21", per_page: "10", page: "2" } });
  });

  it("preserves an API error for the caller", () => {
    api.post("items", { name: "Example" }).subscribe({
      next: () => fail("Expected an HTTP error"),
      error: (error) => expect(error.status).toBe(422),
    });
    const req = http.expectOne("/proxyUrl/items");
    expect(req.request.method).toBe("POST");
    expect(req.request.body).toEqual({ name: "Example" });
    req.flush({ message: "Invalid item" }, { status: 422, statusText: "Unprocessable Entity" });
  });
});
