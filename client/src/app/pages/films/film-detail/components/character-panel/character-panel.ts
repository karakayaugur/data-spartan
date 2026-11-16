import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import {
  LucideRuler,
  LucideWeight,
  LucideFactory,
  LucideDna,
  LucideTags,
  LucideGlobe,
  LucideCalendar,
} from "@lucide/angular";
import { CharacterDetailFacade } from "@core/store";
import { AvatarBadge } from "@shared/shared-ui";

@Component({
  selector: "app-character-panel",
  host: { class: "character-panel" },
  imports: [
    AvatarBadge,
    LucideRuler,
    LucideWeight,
    LucideFactory,
    LucideDna,
    LucideTags,
    LucideGlobe,
    LucideCalendar,
  ],
  providers: [CharacterDetailFacade],
  templateUrl: "./character-panel.html",
  styleUrl: "./character-panel.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CharacterPanel {
  private readonly detailFacade = inject(CharacterDetailFacade);
  readonly character = this.detailFacade.character;
  readonly species = this.detailFacade.species;
  readonly homeworldName = this.detailFacade.homeworldName;
  readonly loading = this.detailFacade.loading;
  readonly failed = this.detailFacade.error;

  load(): void {
    this.detailFacade.retry();
  }

  display(value: string | null | undefined, unit = ""): string {
    return !value || ["unknown", "n/a"].includes(value.toLowerCase())
      ? "Unknown"
      : `${value}${unit}`;
  }
}
