import { HttpErrorResponse, HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { catchError, throwError } from "rxjs";
import { NotificationService } from "@shared/notifications";

export const ErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const notifications = inject(NotificationService);
  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        const message: unknown = error.error?.message;
        const fallback = error.status === 0
          ? "Unable to reach the server. Please check your connection and try again."
          : "Something went wrong. Please try again.";
        notifications.error(typeof message === "string" && message.trim() ? message.trim() : fallback);
      }
      return throwError(() => error);
    }),
  );
};
