import { HttpErrorResponse, provideHttpClient, withInterceptors } from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { ErrorHandler } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { NotificationService, ToastContainer } from "@shared/notifications";
import { ErrorInterceptor } from "@core/interceptors";
import { Sidebar } from "../../layouts/app/sidebar/sidebar";
import { GlobalErrorHandler } from "./global-error-handler";

describe("Global client error handling", () => {
  let backend: HttpTestingController;
  let notifications: NotificationService;
  let handler: ErrorHandler;

  beforeEach(() => {
    TestBed.configureTestingModule({
      rethrowApplicationErrors: false,
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([ErrorInterceptor])),
        provideHttpClientTesting(),
        { provide: ErrorHandler, useClass: GlobalErrorHandler },
      ],
    });
    backend = TestBed.inject(HttpTestingController);
    notifications = TestBed.inject(NotificationService);
    handler = TestBed.inject(ErrorHandler);
    spyOn(console, "error");
  });
  afterEach(() => backend.verify());

  it("catches a real sidebar button error, shows a generic toast, and reports technical details", () => {
    const sidebar = TestBed.createComponent(Sidebar);
    sidebar.detectChanges();
    const toast = TestBed.createComponent(ToastContainer);
    toast.detectChanges();
    const button = Array.from(
      sidebar.nativeElement.querySelectorAll("app-button button") as NodeListOf<HTMLButtonElement>,
    ).find((button) => button.textContent?.includes("Test client error"))!;
    button.click();
    toast.detectChanges();
    expect(toast.nativeElement.querySelector("[role=alert]").textContent).toContain(
      "Something went wrong. Please try again.",
    );
    expect(toast.nativeElement.textContent).not.toContain("This is a test client error.");
    const request = backend.expectOne("/proxyUrl/error");
    expect(request.request.method).toBe("POST");
    expect(request.request.body.source).toBe("client");
    expect(request.request.body.message).toBe("This is a test client error.");
    expect(request.request.body.stack).toContain("testClientError");
    expect(request.request.body.url).toBe(window.location.href);
    request.flush(null, { status: 204, statusText: "No Content" });
  });

  it("silently handles a failed report without another toast or reporting loop", () => {
    handler.handleError(new Error("Client failure"));
    backend.expectOne("/proxyUrl/error").flush({}, { status: 500, statusText: "Server Error" });
    expect(notifications.notifications().length).toBe(1);
    backend.expectNone("/proxyUrl/error");
  });

  it("ignores HTTP errors and normalizes rejected promises", () => {
    handler.handleError(new HttpErrorResponse({ status: 502 }));
    handler.handleError({ rejection: new HttpErrorResponse({ status: 500 }) });
    expect(notifications.notifications().length).toBe(0);
    backend.expectNone("/proxyUrl/error");
    handler.handleError(
      new PromiseRejectionEvent("unhandledrejection", {
        promise: Promise.resolve(),
        reason: new Error("Promise failed"),
      }),
    );
    const request = backend.expectOne("/proxyUrl/error");
    expect(request.request.body.message).toBe("Promise failed");
    request.flush(null);
    expect(notifications.notifications().length).toBe(1);
  });
});
