export interface Film {
  url: string;
  title: string;
  episodeId: number;
  releaseDate: string;
  openingCrawl: string;
  director: string;
  producer: string;
  characters: string[];
  planets: string[];
  starships: string[];
  vehicles: string[];
  species: string[];
  created: string;
  edited: string;
}

export type Films = Film[];
