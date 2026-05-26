import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      colors: {
        brand: {
          primary: "var(--brand-primary)",
          accent: "var(--brand-accent)",
          white: "var(--brand-white)",
          off: "var(--brand-off-white)",
          light: "var(--brand-light-gray)",
          border: "var(--brand-border)",
          mid: "var(--brand-mid-gray)",
          muted: "var(--brand-text-muted)",
          check: "var(--brand-green-check)",
          star: "var(--brand-star)",
        },
      },
    },
  },
  plugins: [],
};

export default config;
