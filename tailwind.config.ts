import type { Config } from "tailwindcss";

/**
 * Design tokens are defined as CSS custom properties in app/globals.css
 * (light in :root, dark under .dark). Tailwind color utilities reference
 * those vars so every color flips with the theme automatically.
 */
const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "var(--canvas)",
        surface: "var(--surface)",
        "surface-2": "var(--surface-2)",
        nav: "var(--nav)",
        "border-subtle": "var(--border-subtle)",
        "border-strong": "var(--border-strong)",
        ink: {
          DEFAULT: "var(--ink)",
          secondary: "var(--ink-secondary)",
          muted: "var(--ink-muted)",
        },
        green: {
          DEFAULT: "var(--green)",
          bg: "var(--green-bg)",
          text: "var(--green-text)",
          border: "var(--green-border)",
        },
        amber: {
          DEFAULT: "var(--amber)",
          bg: "var(--amber-bg)",
        },
        danger: {
          DEFAULT: "var(--red)",
          bg: "var(--red-bg)",
        },
        heartbeat: "var(--heartbeat)",
        track: "var(--track)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "14px",
        xl: "20px",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.4s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
