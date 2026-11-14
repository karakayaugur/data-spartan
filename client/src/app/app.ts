import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { ToastContainer } from "@shared/notifications";
import { AppRoutingService } from "@core/services";

@Component({
  selector: "app-root",
  imports: [RouterOutlet, ToastContainer],
  templateUrl: "./app.html",
  styleUrl: "./app.css",
})
export class App {
  constructor(private appRoutingService: AppRoutingService) {
    this.appRoutingService.initTitleWatcher();
  }
}
