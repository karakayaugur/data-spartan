import { applicationConfig, componentWrapperDecorator, type Preview } from "@storybook/angular";
import {
  LucideCalendar,
  LucideClock,
  LucideCheck,
  LucidePlus,
  LucideX,
  LucideArrowRight,
  LucideLoaderCircle,
  LucideTrash2,
  provideLucideIcons,
} from "@lucide/angular";

const preview: Preview = {
  tags: ["autodocs"],
  initialGlobals: { theme: "light" },
  globalTypes: {
    theme: {
      description: "Application theme",
      toolbar: {
        icon: "circlehollow",
        dynamicTitle: true,
        items: [
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" },
        ],
      },
    },
  },
  decorators: [
    applicationConfig({
      providers: [
        provideLucideIcons(
          LucideCalendar,
          LucideClock,
          LucideCheck,
          LucidePlus,
          LucideX,
          LucideArrowRight,
          LucideLoaderCircle,
          LucideTrash2,
        ),
      ],
    }),
    (story, context) => {
      const theme = context.globals["theme"] === "dark" ? "dark" : "light";
      document.documentElement.setAttribute("color-scheme", theme);
      document.documentElement.classList.toggle("dark", theme === "dark");
      return story();
    },
    componentWrapperDecorator((story) => `<div class="storybook-preview">${story}</div>`),
  ],
  parameters: {
    layout: "padded",
    controls: { expanded: true },
    a11y: { test: "todo" },
    options: { storySort: { order: ["UI", "Modals"] } },
  },
};
export default preview;
