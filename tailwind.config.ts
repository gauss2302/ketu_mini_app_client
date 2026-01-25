import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class", // Use class-based dark mode
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Telegram theme colors
        tg: {
          bg: "var(--tg-theme-bg-color, #ffffff)",
          text: "var(--tg-theme-text-color, #000000)",
          hint: "var(--tg-theme-hint-color, #999999)",
          link: "var(--tg-theme-link-color, #2481cc)",
          button: "var(--tg-theme-button-color, #2481cc)",
          "button-text": "var(--tg-theme-button-text-color, #ffffff)",
          "secondary-bg": "var(--tg-theme-secondary-bg-color, #f1f1f1)",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
