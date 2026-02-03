import type { Config } from "tailwindcss"

export default {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        deriv: {
          bg: "#0a0e17",
          card: "#111827",
          border: "#1f2937",
          text: "#e5e7eb",
          primary: "#3b82f6",
          accent: "#14b8a6",
          danger: "#ef4444",
          muted: "#6b7280",
          warning: "#f59e0b",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config
