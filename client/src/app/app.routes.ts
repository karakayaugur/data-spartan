import { Routes } from "@angular/router";
import { AppLayout } from "./layouts/app/app-layout";

export const routes: Routes = [
  { path: "", pathMatch: "full", redirectTo: "dashboard" },
  { path: "", component: AppLayout, children: [
    { path: "films/:id", title: "Film", loadComponent: () => import("./pages/films/film-detail").then(m => m.FilmDetail) },
    { path: "dashboard", title: "Dashboard", loadComponent: () => import("./pages/dashboard/dashboard").then(m => m.Dashboard) },
  ] },
  { path: "**", redirectTo: "dashboard" },
];
