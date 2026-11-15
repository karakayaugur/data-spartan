import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { ToastContainer } from "@shared/notifications";

@Component({
  selector: "app-root",
  host: { class: "app" },
  imports: [RouterOutlet, ToastContainer],
  templateUrl: "./app.html",
  styleUrl: "./app.scss",
})
export class App {}
