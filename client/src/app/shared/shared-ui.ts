import { InputPickerComponent } from "./ui/inputs/input-picker/input-picker.component";
import { BadgeComponent } from "./ui/badge/badge.component";
export type { BadgeVariant } from "./ui/badge/badge.component";
import { ButtonComponent } from "./ui/buttons/button/button.component";
import { InputTextareaComponent } from "./ui/inputs/input-textarea/input-textarea.component";
export { BadgeComponent, InputPickerComponent, ButtonComponent, InputTextareaComponent };

export const SharedUi = [
  BadgeComponent,
  InputPickerComponent,
  InputTextareaComponent,
  ButtonComponent,
];
