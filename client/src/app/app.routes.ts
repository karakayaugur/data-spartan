import { Routes } from "@angular/router";
import { AppLayout } from "./layouts/app/app-layout";

export const routes: Routes = [
  { path: "", pathMatch: "full", redirectTo: "dashboard" },
  {
    path: "",
    component: AppLayout,
    children: [
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
      {
        path: "dashboard",
        title: "Dashboard",
        loadComponent: () => import("./pages/dashboard/dashboard").then((m) => m.Dashboard),
      },
    ],
  },
  { path: "**", redirectTo: "dashboard" },
];
