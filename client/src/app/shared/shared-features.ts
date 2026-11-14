import { PageHeaderComponent } from "./features/page-header/page-header.component";
import { AlertComponent } from "./features/alert/alert.component";
import { ThemeToggleComponent } from "./features/theme-toggle/theme-toggle";
import { LanguageToggleComponent } from "./features/language-toggle/language-toggle";
export const SharedFeatures = [
  PageHeaderComponent,
  AlertComponent,
  ThemeToggleComponent,
  LanguageToggleComponent,
] as const;

export {
  PageHeaderComponent,
  AlertComponent,
  ThemeToggleComponent,
  LanguageToggleComponent,
};
