import { Injectable, signal } from "@angular/core";

@Injectable()
export class MobileNavService {
  readonly open = signal(false);
  toggle(): void { this.open.update(value => !value); }
  close(): void { this.open.set(false); }
}
