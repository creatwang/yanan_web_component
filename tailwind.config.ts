import type { Config } from "tailwindcss";

export default {
  prefix: "yn-",
  content: ["./src/**/*.{ts,html}", "./.storybook/**/*.{ts,js}"],
  theme: {
    extend: {}
  },
  plugins: []
} satisfies Config;
