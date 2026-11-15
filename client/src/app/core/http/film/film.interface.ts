export interface ResponseModel<T> {
  results: T[];
}

export interface FilmSummary {
  url: string;
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
