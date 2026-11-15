import type { StorybookConfig } from "@storybook/angular";

const config: StorybookConfig = {
  stories: ["../src/app/shared/**/*.stories.ts"],
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y"],
  framework: "@storybook/angular",
  staticDirs: ["../public", { from: "../src/assets", to: "/assets" }],
  core: { disableTelemetry: true },
};
export default config;
