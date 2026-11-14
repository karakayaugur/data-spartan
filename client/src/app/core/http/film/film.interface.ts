export interface FilmSummary {
  id: number;
  title: string;
  episodeId: number;
  releaseDate: string;
}

export interface CastMember {
  id: number;
  name: string;
}

export interface Film extends FilmSummary {
  openingCrawl: string;
  director: string;
  cast: CastMember[];
}
