export interface ClientErrorReport {
  source: "client";
  message: string;
  stack?: string;
  url: string;
}
