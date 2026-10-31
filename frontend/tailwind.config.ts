import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Queen's Jewels Aura — emerald + gold
        ink: "#0B2E26",
        muted: "#5c6f69",
        line: "#d7e0dc",
        blush: "#eef4f1",
        "blush-deep": "#dce8e3",
        soft: "#f3f6f4",
        sale: "#a63d3d",
        forest: "#0B2E26",
        "forest-deep": "#06201B",
        gold: "#C5A059",
        "gold-soft": "#E8D5A3",
        cream: "#F5F1E8",
        // legacy aliases (admin + existing pages)
        ivory: "#F5F1E8",
        champagne: "#0B2E26",
        "champagne-dark": "#5c6f69",
        charcoal: "#0B2E26",
        "charcoal-muted": "#5c6f69",
      },
      fontFamily: {
        script: ["var(--font-script)", "cursive"],
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
