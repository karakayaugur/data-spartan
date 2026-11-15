import type { Meta, StoryObj } from "@storybook/angular";
import { InputFeedbackComponent } from "./input-feedback.component";
const meta: Meta<InputFeedbackComponent> = {
  title: "UI/Inputs/Feedback",
  component: InputFeedbackComponent,
  args: { message: "Please fill this field.", feedbackId: "storybook-feedback" },
};
export default meta;
type Story = StoryObj<InputFeedbackComponent>;
export const Required: Story = {};
export const LongMessage: Story = {
  args: {
    message:
      "Please enter a valid value. The information you provide must meet the requirements shown for this field.",
  },
};
