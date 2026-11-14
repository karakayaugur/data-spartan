import { PageHeaderComponent } from "./features/page-header/page-header.component";
import { ThemeToggleComponent } from "./features/theme-toggle/theme-toggle";
export const SharedFeatures = [PageHeaderComponent, ThemeToggleComponent] as const;

export { PageHeaderComponent, ThemeToggleComponent };
