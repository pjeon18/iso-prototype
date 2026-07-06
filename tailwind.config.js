/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        accent: "var(--iso-accent)",
        "accent-soft": "var(--iso-accent-soft)",
        "accent-tint": "var(--iso-accent-tint)",
        cream: "var(--iso-bg)",
        surface: "var(--iso-surface)",
        ink: "var(--iso-text)",
        ink2: "var(--iso-text-2)",
        ink3: "var(--iso-text-3)",
        neutral2: "var(--iso-neutral)",
        green2: "var(--iso-green)",
      },
      fontFamily: {
        display: ["Poppins", "system-ui", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "14px",
        "card-lg": "16px",
        pill: "99px",
      },
    },
  },
  plugins: [],
};
