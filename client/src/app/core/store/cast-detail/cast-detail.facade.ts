import { inject, Injectable } from "@angular/core";
import { firstValueFrom, forkJoin, of } from "rxjs";
import { catchError } from "rxjs/operators";
import { CastDetailStore } from "./cast-detail.store";
import type { CastMember } from "@core/http/film/film.interface";
// Not: Projendeki Planet ve Species servislerinin import yolları
import { PlanetService } from "@core/http/planet/planet.service";
import { SpeciesService } from "@core/http/species/species.service";

@Injectable({ providedIn: "root" })
export class CastDetailFacade {
  private readonly store = inject(CastDetailStore);
  private readonly planetApi = inject(PlanetService);
  private readonly speciesApi = inject(SpeciesService);

  // Component'in okuyacağı Readonly Signal'ler
  readonly selectedCharacter = this.store.selectedCharacter;
  readonly homeworldName = this.store.homeworldName;
  readonly speciesName = this.store.speciesName;
  readonly speciesClassification = this.store.speciesClassification;
  readonly loading = this.store.loading;

  /**
   * Menüden bir karakter tıklandığında çağrılır
   */
  async selectCharacter(member: CastMember): Promise<void> {
    // 1. Temel bilgiyi hemen state'e bas (Anında UI tepkisi için)
    this.store.setState({
      selectedCharacter: member,
      homeworldName: null,
      speciesName: null,
      speciesClassification: null,
      loading: !member.isDroid, // Eğer robot değilse loading açılır
    });

    // 2. Karakter Droid ise ekstra network isteğine gerek yok, burada bitir
    if (member.isDroid) {
      this.store.setState({
        homeworldName: "N/A",
        speciesName: "Droid",
        speciesClassification: "Artificial",
      });
      return;
    }

    // 3. Organik karakter ise Homeworld ve Species URL'lerinden ID'leri çöz ve paralel çek
    try {
      const planetId = member.homeworld ? this.idFromUrl(member.homeworld) : null;
      const speciesId = member.species?.length ? this.idFromUrl(member.species[0]) : null;

      const planet$ = planetId
        ? this.planetApi.getById(planetId).pipe(catchError(() => of(null)))
        : of(null);

      const species$ = speciesId
        ? this.speciesApi.getById(speciesId).pipe(catchError(() => of(null)))
        : of(null);

      const [planet, species] = await firstValueFrom(forkJoin([planet$, species$]));

      this.store.setState({
        homeworldName: planet?.name ?? "Unknown",
        speciesName: species?.name ?? "Human", // SWAPI'de boş gelenler genelde Human'dır
        speciesClassification: species?.classification ?? "Mammal",
        loading: false,
      });
    } catch {
      this.store.setState({
        homeworldName: "Unknown",
        speciesName: "Unknown",
        speciesClassification: "Unknown",
        loading: false,
      });
    }
  }

  private idFromUrl(url: string): number | null {
    const match = url.match(/\/(\d+)\/?$/);
    return match ? Number(match[1]) : null;
  }

  public clearSelection(): void {
    this.store.clear();
  }
}
