import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,html}", "./.storybook/**/*.{ts,js}"],
  theme: {
    extend: {}
  },
  plugins: []
} satisfies Config;
