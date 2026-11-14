import { HttpErrorResponse } from "@angular/common/http";
import { ErrorHandler, inject, Injectable, Injector } from "@angular/core";
import { NotificationService } from "@shared/notifications";
import { ClientErrorReporter } from "@core/http/error";

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private readonly notificationService = inject(NotificationService);
  private readonly errorReporter = inject(ClientErrorReporter);

  handleError(error: unknown): void {
    const original = this.unwrap(error);
    // HTTP errors have already been displayed by ErrorInterceptor.
    if (original instanceof HttpErrorResponse) return;

    console.error("Unhandled client error", original);
    try {

      // We can use sentry SDK or any other error reporting tool here to report the error to a server or a monitoring service. 
      // For now, we will just log the error and show a notification to the user.
      // We will check client error on aws cloudwatch.

      this.notificationService.error("Something went wrong. Please try again.");
      this.errorReporter.report({
        source: "client",
        message: original instanceof Error ? original.message : typeof original === "string" ? original : "Unknown client error",
        stack: original instanceof Error ? original.stack : undefined,
        url: window.location.href,
      });
    } catch (reportingError) {
      // Fail safely if dependencies are unavailable during application startup.
      console.error("Unable to report client error", reportingError);
    }
  }

  private unwrap(error: unknown): unknown {
    if (error instanceof ErrorEvent) return error.error ?? error.message;
    if (error instanceof PromiseRejectionEvent) return error.reason;
    if (error && typeof error === "object" && "rejection" in error) return error.rejection;
    return error;
  }
}
