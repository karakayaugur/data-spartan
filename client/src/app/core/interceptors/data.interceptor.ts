import { HttpInterceptorFn, HttpResponse } from "@angular/common/http";
import { map } from "rxjs";
import camelcaseKeys from "camelcase-keys";

export const DataInterceptor: HttpInterceptorFn = (req, next) => {
  const isTargetUrl = req.url.startsWith("/proxyUrl/");

  if (!isTargetUrl) {
    return next(req);
  }

  return next(req).pipe(
    map((event) => {
      if (event instanceof HttpResponse && event.body !== null && typeof event.body === "object") {
        const body =
          "results" in event.body && Array.isArray(event.body.results)
            ? event.body.results
            : event.body;
        const transformedBody = camelcaseKeys(body, { deep: true });
        return event.clone({ body: transformedBody });
      }
      return event;
    }),
  );
};
