import { HttpContext, HttpHeaders, HttpParams } from "@angular/common/http";

export type ApiQueryValue = string | number | boolean;

export interface ApiRequestOptions {
  params?: HttpParams | Record<string, ApiQueryValue | readonly ApiQueryValue[]>;
  headers?: HttpHeaders | Record<string, string | string[]>;
  context?: HttpContext;
}

