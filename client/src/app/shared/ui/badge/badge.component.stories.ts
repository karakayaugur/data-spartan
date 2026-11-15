import type { Meta, StoryObj } from "@storybook/angular";
import { BadgeComponent } from "./badge.component";
const variants = [
  "default",
  "success",
  "error",
  "info",
  "primary",
  "danger",
  "warning",
  "primary-outline",
  "danger-outline",
  "warning-outline",
];
const meta: Meta<BadgeComponent> = {
  title: "UI/Badge",
  component: BadgeComponent,
  args: {
    label: "Active",
    variant: "success",
    type: "label",
    dot: false,
    icon: null,
    value: 3,
    probability: null,
  },
  argTypes: {
    variant: { control: "select", options: variants },
    type: { control: "inline-radio", options: ["label", "number"] },
    icon: { control: "select", options: [null, "check", "plus"] },
    probability: { control: "select", options: [null, "low", "mid", "high"] },
  },
};
export default meta;
type Story = StoryObj<BadgeComponent>;
export const Default: Story = {};
export const StatusDot: Story = { args: { label: "Online", dot: true } };
export const WithIcon: Story = { args: { label: "Completed", icon: "check" } };
export const Number: Story = { args: { type: "number", value: 6, variant: "default" } };
export const NumberOverflow: Story = { args: { type: "number", value: 12, variant: "default" } };
export const Probability: Story = { args: { label: "HIGH", probability: "high" } };
export const Variants: Story = {
  render: () => ({
    template: `<div style="display:flex;flex-wrap:wrap;gap:12px">${variants.map((variant) => `<app-badge label="${variant}" variant="${variant}"></app-badge>`).join("")}</div>`,
  }),
};
