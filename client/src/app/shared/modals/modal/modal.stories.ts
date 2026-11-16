import type { Meta, StoryObj } from "@storybook/angular";
import { ModalDemo } from "./stories/modal-demo.story";
const meta: Meta<ModalDemo> = {
  title: "Modals/Modal",
  component: ModalDemo,
  args: { title: "Example modal", size: "medium" },
  argTypes: { size: { control: "select", options: ["small", "medium", "large", "full"] } },
};
export default meta;
type Story = StoryObj<ModalDemo>;
export const Default: Story = {};
export const Small: Story = { args: { size: "small" } };
export const Large: Story = { args: { size: "large" } };
export const Full: Story = { args: { size: "full" } };
