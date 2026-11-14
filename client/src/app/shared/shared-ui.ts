import { InputTimeComponent } from "./ui/inputs/input-time/input-time.component";
import { BadgeComponent } from "./ui/badge/badge.component";
export type { BadgeVariant } from "./ui/badge/badge.component";
import { AvatarBadgeComponent } from "./ui/avatar-badge";
export type { AvatarBadgeType } from "./ui/avatar-badge";
import { InputDateComponent } from "./ui/inputs/input-date/input-date.component";
import { ButtonComponent } from "./ui/buttons/button/button.component";
import { InputTextareaComponent } from "./ui/inputs/input-textarea/input-textarea.component";
export {
  BadgeComponent,
  AvatarBadgeComponent,
  InputDateComponent,
  InputTimeComponent,
  ButtonComponent,
  InputTextareaComponent,
};

export const SharedUi = [
  BadgeComponent,
  AvatarBadgeComponent,
  InputDateComponent,
  InputTimeComponent,
  InputTextareaComponent,
  ButtonComponent,
];
