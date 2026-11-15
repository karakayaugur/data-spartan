import type { Meta, StoryObj } from "@storybook/angular";
import { InputTimeComponent } from "./input-time.component";
import { ButtonComponent } from "@shared/shared-ui";
import { moduleMetadata } from "@storybook/angular";

const meta: Meta<InputTimeComponent> = {
  title: "UI/Inputs/Time",
  component: InputTimeComponent,
  decorators: [moduleMetadata({ imports: [ButtonComponent] })],
  args: { inputId: "storybook-time", label: "Time", required: true, value: "" },
  render: (args) => ({
    props: args,
    template: `<div class="storybook-input"><app-input-time [inputId]="inputId" [label]="label" [required]="required" [(value)]="value"></app-input-time></div>`,
  }),
};
export default meta;
type Story = StoryObj<InputTimeComponent>;
export const Empty: Story = {};
export const Filled: Story = { args: { value: "14:30" } };
export const Optional: Story = { args: { required: false } };
export const Validation: Story = {
  render: (args) => ({
    props: args,
    template: `<div class="storybook-input"><app-input-time #field [inputId]="inputId" [label]="label" [required]="true" [(value)]="value"></app-input-time><app-button label="Validate" (clicked)="field.validate()"></app-button></div>`,
  }),
};
