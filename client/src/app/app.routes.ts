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
        loadComponent: () => import("./pages/films/films").then((m) => m.Films),
      },
      {
        path: "films/:id",
        title: "Film",
        loadComponent: () => import("./pages/films/film-detail").then((m) => m.FilmDetail),
      },
      {
        path: "badges",
        title: "Badges",
        loadComponent: () => import("./pages/badges/badges").then((m) => m.Badges),
      },
      {
        path: "buttons",
        title: "Buttons",
        loadComponent: () => import("./pages/buttons/buttons").then((m) => m.Buttons),
      },
    ],
  },
  { path: "**", redirectTo: "films" },
];
