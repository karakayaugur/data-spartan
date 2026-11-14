import { Component, DestroyRef, inject, input, signal } from "@angular/core";
import { takeUntilDestroyed, toObservable } from "@angular/core/rxjs-interop";
import { catchError, combineLatest, of, startWith, Subject, switchMap, tap } from "rxjs";
import { AvatarBadgeComponent } from "@shared/ui/avatar-badge";
import { Character, CharacterService } from "@core/http";

@Component({
  selector: "app-character-panel",
  imports: [AvatarBadgeComponent],
  templateUrl: "./character-panel.html",
  styleUrl: "./character-panel.css",
})
export class CharacterPanel {
  readonly characterId = input.required<number>();
  private readonly service = inject(CharacterService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly reload = new Subject<void>();
  readonly character = signal<Character | null>(null);
  readonly loading = signal(true);
  readonly failed = signal(false);

  constructor() {
    combineLatest([toObservable(this.characterId), this.reload.pipe(startWith(undefined))]).pipe(
      tap(() => { this.loading.set(true); this.failed.set(false); this.character.set(null); }),
      switchMap(([id]) => this.service.getById(id).pipe(catchError(() => { this.failed.set(true); return of(null); }))),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(character => { this.character.set(character); this.loading.set(false); });
  }

  load(): void { this.reload.next(); }

  display(value: string, unit = ""): string {
    return !value || ["unknown", "n/a"].includes(value.toLowerCase()) ? "Unknown" : `${value}${unit}`;
  }
}
