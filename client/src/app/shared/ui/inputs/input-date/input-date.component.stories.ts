import type { Meta, StoryObj } from "@storybook/angular";
import { InputDateComponent } from "./input-date.component";
import { ButtonComponent } from "@shared/shared-ui";
import { moduleMetadata } from "@storybook/angular";

const meta: Meta<InputDateComponent> = {
  title: "UI/Inputs/Date",
  component: InputDateComponent,
  decorators: [moduleMetadata({ imports: [ButtonComponent] })],
  args: { inputId: "storybook-date", label: "Date", required: true, value: "" },
  render: (args) => ({
    props: args,
    template: `<div class="storybook-input"><app-input-date [inputId]="inputId" [label]="label" [required]="required" [(value)]="value"></app-input-date></div>`,
  }),
};
export default meta;
type Story = StoryObj<InputDateComponent>;
export const Empty: Story = {};
export const Filled: Story = { args: { value: "2026-11-07" } };
export const Optional: Story = { args: { required: false } };
export const Validation: Story = {
  render: (args) => ({
    props: args,
    template: `<div class="storybook-input"><app-input-date #field [inputId]="inputId" [label]="label" [required]="true" [(value)]="value"></app-input-date><app-button label="Validate" (clicked)="field.validate()"></app-button></div>`,
  }),
};
