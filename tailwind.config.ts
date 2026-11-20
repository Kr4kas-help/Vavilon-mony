import type { Config } from "tailwindcss";

// Имена цветов те же, что в money-wise (ink, spruce, honey, rose, mist),
// но значения тёмные и золотые: перенесённые компоненты выглядят по макету.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#120D08",
        ink: "#F1E6CC",
        spruce: "#D9A441",
        honey: "#E8B84F",
        rose: "#E07A66",
        mist: "#2A2015",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
