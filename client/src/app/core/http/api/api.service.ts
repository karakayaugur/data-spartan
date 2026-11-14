import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { ApiRequestOptions } from "./api.interface";

/** Shared transport for feature services. Paths are relative to /proxyUrl. */
@Injectable({ providedIn: "root" })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = "/proxyUrl";

  get<T>(path: string, options?: ApiRequestOptions): Observable<T> {
    return this.http.get<T>(this.url(path), options);
  }

  post<T>(path: string, payload: unknown, options?: ApiRequestOptions): Observable<T> {
    return this.http.post<T>(this.url(path), payload, options);
  }

  put<T>(path: string, payload: unknown, options?: ApiRequestOptions): Observable<T> {
    return this.http.put<T>(this.url(path), payload, options);
  }

  patch<T>(path: string, payload: unknown, options?: ApiRequestOptions): Observable<T> {
    return this.http.patch<T>(this.url(path), payload, options);
  }

  delete<T>(path: string, options?: ApiRequestOptions): Observable<T> {
    return this.http.delete<T>(this.url(path), options);
  }

  private url(path: string): string {
    return `${this.baseUrl}/${path.replace(/^\/+/, "")}`;
  }
}
