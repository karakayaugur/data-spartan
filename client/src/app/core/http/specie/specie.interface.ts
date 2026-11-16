export interface Specie {
  name: string;
  classification: string;
  designation: string;
  averageHeight: string;
  skinColors: string;
  hairColors: string;
  eyeColors: string;
  averageLifespan: string;
  homeworld: string | null;
  language: string;
  people: string[];
  films: string[];
  created: string;
  edited: string;
  url: string;
}

export type Species = Specie[];
