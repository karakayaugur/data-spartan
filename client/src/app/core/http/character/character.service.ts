import { inject, Injectable } from "@angular/core";
import { ApiService } from "../api";
import { Character } from "./character.interface";

@Injectable({ providedIn: "root" })
export class CharacterService {
  private readonly api = inject(ApiService);

  getById(id: number) { return this.api.get<Character>(`characters/${id}`); }
}
