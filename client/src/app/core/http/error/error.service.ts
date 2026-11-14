import { HttpBackend, HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { catchError, EMPTY, timeout } from "rxjs";

import { ClientErrorReport } from "./error.interface";

@Injectable({ providedIn: "root" })
export class ClientErrorReporter {
  // Report failures bypass interceptors so a failed report cannot create another toast.
  private readonly http = new HttpClient(inject(HttpBackend));

  report(error: ClientErrorReport): void {
    this.http.post<void>("/proxyUrl/error", error).pipe(
      timeout(5000),
      catchError(() => EMPTY),
    ).subscribe();
  }
}
