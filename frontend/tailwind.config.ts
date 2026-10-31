import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#111111",
        muted: "#6b6b6b",
        line: "#e8e8e8",
        blush: "#f7f0ee",
        "blush-deep": "#efe4e0",
        soft: "#f5f5f5",
        sale: "#c45c5c",
        // legacy aliases (admin + existing pages)
        ivory: "#ffffff",
        cream: "#f7f0ee",
        champagne: "#111111",
        "champagne-dark": "#6b6b6b",
        charcoal: "#111111",
        "charcoal-muted": "#6b6b6b",
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
