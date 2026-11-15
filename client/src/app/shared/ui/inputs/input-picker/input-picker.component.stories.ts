import type { Meta, StoryObj } from "@storybook/angular";
import { moduleMetadata } from "@storybook/angular";
import { InputPickerComponent } from "./input-picker.component";
import { ButtonComponent } from "../../buttons/button/button.component";
const meta: Meta<InputPickerComponent> = {
  title: "UI/Inputs/Picker",
  component: InputPickerComponent,
  decorators: [moduleMetadata({ imports: [ButtonComponent] })],
  args: {
    inputId: "storybook-picker",
    label: "Date",
    type: "date",
    size: "medium",
    required: true,
    value: "",
    min: "",
    max: "",
  },
  argTypes: {
    size: { control: "inline-radio", options: ["small", "medium", "large"] },
  },
  render: (args) => ({
    props: args,
    template: `<div class="storybook-input"><app-input-picker #field [inputId]="inputId" [label]="label" [type]="type" [size]="size" [required]="required" [min]="min" [max]="max" [(value)]="value"></app-input-picker><app-button label="Validate" (clicked)="field.validate()"></app-button></div>`,
  }),
};
export default meta;
type Story = StoryObj<InputPickerComponent>;
export const Date: Story = {};
export const Small: Story = { args: { size: "small" } };
export const Large: Story = { args: { size: "large" } };
export const DateFilled: Story = { args: { value: "2026-11-07" } };
export const Time: Story = { args: { type: "time", label: "Time" } };
export const TimeFilled: Story = { args: { type: "time", label: "Time", value: "00:10" } };
export const Optional: Story = { args: { required: false } };
export const DateBounds: Story = { args: { min: "1900-01-01", max: "2026-11-15" } };
