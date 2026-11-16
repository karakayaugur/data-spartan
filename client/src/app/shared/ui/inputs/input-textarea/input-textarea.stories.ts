import type { Meta, StoryObj } from "@storybook/angular";
import { InputTextarea } from "./input-textarea";
import { Button } from "@shared/shared-ui";
import { moduleMetadata } from "@storybook/angular";

const meta: Meta<InputTextarea> = {
  title: "UI/Inputs/Description",
  component: InputTextarea,
  decorators: [moduleMetadata({ imports: [Button] })],
  args: {
    inputId: "storybook-textarea",
    label: "Description",
    required: true,
    value: "",
    placeholder: "Add a description…",
    rows: 3,
    readonly: false,
    maxLength: null,
    minLength: 0,
  },
  render: (args) => ({
    props: args,
    template: `<div class="storybook-input"><app-input-textarea [inputId]="inputId" [label]="label" [required]="required" [(value)]="value" [placeholder]="placeholder" [rows]="rows" [readonly]="readonly" [maxLength]="maxLength" [minLength]="minLength"></app-input-textarea></div>`,
  }),
};
export default meta;
type Story = StoryObj<InputTextarea>;
export const Empty: Story = {};
export const Filled: Story = { args: { value: "A wonderful film to watch again." } };
export const Optional: Story = { args: { required: false } };
export const Validation: Story = {
  render: (args) => ({
    props: args,
    template: `<div class="storybook-input"><app-input-textarea #field [inputId]="inputId" [label]="label" [required]="true" [(value)]="value"></app-input-textarea><app-button label="Validate" (clicked)="field.validate()"></app-button></div>`,
  }),
};
export const CharacterLimit: Story = { args: { maxLength: 120, value: "A wonderful film." } };
export const Readonly: Story = { args: { readonly: true, value: "Saved description" } };
