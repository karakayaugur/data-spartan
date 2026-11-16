import type { Meta, StoryObj } from "@storybook/angular";
import { fn } from "storybook/test";
import { Button } from "./button";

const variants = [
  "primary",
  "neutral",
  "ghost",
  "danger",
  "warning",
  "primary-outline",
  "danger-outline",
  "warning-outline",
];
const meta: Meta<Button> = {
  title: "UI/Button",
  component: Button,
  args: {
    label: "Save changes",
    variant: "primary",
    size: "medium",
    disabled: false,
    block: false,
    loading: false,
    iconOnly: false,
    icon: null,
    iconPosition: "start",
    clicked: fn(),
  },
  argTypes: {
    block: { control: "boolean" },
    variant: { control: "select", options: variants },
    size: { control: "inline-radio", options: ["small", "medium", "large"] },
    icon: { control: "select", options: [null, "plus", "check", "arrow-right", "trash-2", "x"] },
    iconPosition: { control: "inline-radio", options: ["start", "end"] },
  },
};
export default meta;
type Story = StoryObj<Button>;
export const Default: Story = {};
export const Block: Story = { args: { block: true } };
export const WithIcon: Story = { args: { icon: "plus", label: "Add viewing" } };
export const IconOnly: Story = {
  args: { icon: "x", iconOnly: true, ariaLabel: "Close", variant: "ghost" },
};
export const Disabled: Story = { args: { disabled: true } };
export const Loading: Story = { args: { loading: true, loadingLabel: "Saving…" } };
export const Variants: Story = {
  render: () => ({
    template: `<div style="display:flex;flex-wrap:wrap;gap:12px">${variants.map((variant) => `<app-button label="${variant}" variant="${variant}"></app-button>`).join("")}</div>`,
  }),
};
export const Sizes: Story = {
  render: () => ({
    template: `<div style="display:flex;align-items:center;gap:12px"><app-button label="Small" size="small"></app-button><app-button label="Medium" size="medium"></app-button><app-button label="Large" size="large"></app-button></div>`,
  }),
};
