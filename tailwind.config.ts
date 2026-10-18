import type { Config } from "tailwindcss";

// MilliyGo superapp (lib/features/food/widgets/milliy_brand.dart) ranglari
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#111111",
        "ink-2": "#374151",
        muted: "#6B7280",
        faint: "#9CA3AF",
        line: "#EEF0F3",
        chip: "#F2F3F5",
        green: { DEFAULT: "#15803D", bright: "#16A34A", soft: "#E8F7EE", tint: "#DCFCE7" },
        gold: { DEFAULT: "#F5B400", soft: "#FFF4CC" },
        sale: "#EF4444",
        closed: { bg: "#FEF2F2", fg: "#991B1B", icon: "#DC2626" },
      },
      fontFamily: {
        sans: ["var(--font-outfit)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        heading: "-0.4px",
        display: "-0.8px",
      },
      borderRadius: {
        card: "16px",
        tile: "20px",
        sheet: "24px",
      },
      boxShadow: {
        bar: "0 4px 10px rgba(0,0,0,0.06)",
        float: "0 6px 24px rgba(17,17,17,0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
