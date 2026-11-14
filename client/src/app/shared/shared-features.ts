import { PageHeaderComponent } from "./features/page-header/page-header.component";
import { AlertComponent } from "./features/alert/alert.component";
import { ThemeToggleComponent } from "./features/theme-toggle/theme-toggle";
export const SharedFeatures = [
  PageHeaderComponent,
  AlertComponent,
  ThemeToggleComponent,
] as const;

export {
  PageHeaderComponent,
  AlertComponent,
  ThemeToggleComponent,
};
