import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "milliy-blue": "#0052B4",
        "milliy-turquoise": "#008080",
        "milliy-turquoise-2": "#00B5AD",
        "milliy-gold": "#C5A059",
        "milliy-gold-hover": "#E5C583",
        "milliy-red": "#D22B2B",
        "milliy-text": "#111827",
        "milliy-cream": "#FDFBF7",
      },
      fontFamily: {
        sans: ["var(--font-outfit)", "sans-serif"],
        script: ["var(--font-satisfy)", "cursive"],
      },
    },
  },
  plugins: [],
};

export default config;
