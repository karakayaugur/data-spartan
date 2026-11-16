import { inject } from "@angular/core";
import { FilmFacade } from "@core/store";
import { Routes } from "@angular/router";
import { AppLayout } from "./layouts/app/app-layout";

export const routes: Routes = [
  { path: "", pathMatch: "full", redirectTo: "films" },
  {
    path: "",
    component: AppLayout,
    children: [
      {
        path: "films",
        title: "Films",
        loadComponent: () => import("./pages/films/film-list/film-list").then((m) => m.FilmList),
      },
      {
        path: "films/:episodeId",
        title: (route) => {
          const episodeId = Number(route.paramMap.get("episodeId"));
          // update browser title
          return (
            inject(FilmFacade)
              .films()
              .find((film) => film.episodeId === episodeId)?.title ?? "Film"
          );
        },
        loadComponent: () =>
          import("./pages/films/film-detail/film-detail").then((m) => m.FilmDetail),
      },
    ],
  },
  { path: "**", redirectTo: "films" },
];
