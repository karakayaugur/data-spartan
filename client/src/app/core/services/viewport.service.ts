import { BreakpointObserver } from "@angular/cdk/layout";
import { inject, Injectable } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { distinctUntilChanged, map } from "rxjs";

const MOBILE_QUERY = "(max-width: 640px)";

@Injectable({ providedIn: "root" })
export class ViewportService {
  private readonly breakpoint = inject(BreakpointObserver);

  readonly isMobile = toSignal(
    this.breakpoint.observe(MOBILE_QUERY).pipe(
      map((state) => state.matches),
      distinctUntilChanged(),
    ),
    { initialValue: this.breakpoint.isMatched(MOBILE_QUERY) },
  );
}
