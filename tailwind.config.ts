import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: "var(--cream-50)",
          100: "var(--cream-100)",
          200: "var(--cream-200)",
          300: "var(--cream-300)",
          400: "var(--cream-400)",
        },
        indigo: {
          deep: "var(--indigo-deep)",
          DEFAULT: "var(--indigo-primary)",
          muted: "var(--indigo-muted)",
          light: "var(--indigo-light)",
        },
        ribbon: {
          DEFAULT: "var(--ribbon-red)",
          dark: "var(--ribbon-dark)",
          light: "var(--ribbon-light)",
        },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        gujarati: ["var(--font-gujarati)", "sans-serif"],
      },
      boxShadow: {
        paper: "0 2px 4px rgba(45, 33, 17, 0.05), 0 1px 2px rgba(45, 33, 17, 0.08)",
        "paper-lift": "0 6px 16px -2px rgba(45, 33, 17, 0.08), 0 2px 6px -1px rgba(45, 33, 17, 0.05)",
      },
    },
  },
  plugins: [],
};

export default config;
