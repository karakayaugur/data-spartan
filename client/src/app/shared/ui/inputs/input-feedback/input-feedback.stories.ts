import type { Meta, StoryObj } from "@storybook/angular";
import { InputFeedback } from "./input-feedback";
const meta: Meta<InputFeedback> = {
  title: "UI/Inputs/Feedback",
  component: InputFeedback,
  args: { message: "Please fill this field.", feedbackId: "storybook-feedback" },
};
export default meta;
type Story = StoryObj<InputFeedback>;
export const Required: Story = {};
export const LongMessage: Story = {
  args: {
    message:
      "Please enter a valid value. The information you provide must meet the requirements shown for this field.",
  },
};
