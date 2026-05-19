import "../src/styles/tailwind.css";

const applyYnTheme = (theme: string) => {
  document.documentElement.setAttribute("data-yn-theme", theme);
};

const preview = {
  globalTypes: {
    ynTheme: {
      name: "主题",
      description: "全局浅色 / 深色主题（`data-yn-theme`）",
      defaultValue: "light",
      toolbar: {
        icon: "circlehollow",
        items: [
          { value: "light", title: "浅色" },
          { value: "dark", title: "深色" }
        ],
        dynamicTitle: true
      }
    }
  },
  decorators: [
    (story, context) => {
      applyYnTheme(String(context.globals.ynTheme ?? "light"));
      return story();
    }
  ],
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i
      }
    }
  }
};

export default preview;
