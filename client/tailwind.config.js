/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#0F6CBD",
        secondary: "#33AAFF",
        accent: "#00D2FF",
        danger: "#FF5252",
        success: "#4CAF50",
        warning: "#FFC107",
        gray: {
          50: "#F9FAFB",
          100: "#F3F4F6",
          200: "#E5E7EB",
          300: "#D1D5DB",
          400: "#9CA3AF",
          500: "#6B7280",
          600: "#4B5563",
          700: "#374151",
          800: "#1F2937",
          900: "#111827",
        },
      },
      fontFamily: {
        sans: ["Montserrat", "Inter", "Arial", "sans-serif"],
        heading: ["Raleway", "Inter", "sans-serif"],
      },
      boxShadow: {
        card: "0 4px 20px rgba(0, 0, 0, 0.05)",
        nav: "0 2px 10px rgba(0, 0, 0, 0.05)",
        btn: "0 4px 14px rgba(15, 108, 189, 0.25)",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
      },
    },
  },
  plugins: [],
};
