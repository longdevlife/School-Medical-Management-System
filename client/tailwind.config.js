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
      animation: {
        fadeIn: "fadeIn 0.5s ease-in-out",
        slideUp: "slideUp 0.5s ease-in-out",
        pulse: "pulse 2s infinite",
        float: "float 10s ease-in-out infinite",
        floatBubble: "floatBubble 6s ease-in-out infinite",
        "bounce-slow": "bounce 3s infinite",
        "spin-slow": "spin 3s linear infinite",
        fadeInUp: "fadeInUp 0.8s ease-in-out",
        pulseShadow: "pulseShadow 2s infinite",
        slide: "slide 15s ease-in-out infinite",
        slideRight: "slideRight 0.6s ease-in-out",
        slideLeft: "slideLeft 0.6s ease-in-out",
        hover: "hover 3s ease-in-out infinite",
        pop: "pop 0.3s ease-in-out",
        slideTransition: "slideTransition 0.4s ease-in-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        float: {
          "0%": { transform: "translateY(0) translateX(0)", opacity: "0" },
          "50%": { opacity: "1" },
          "100%": {
            transform: "translateY(-100vh) translateX(100px)",
            opacity: "0",
          },
        },
        floatBubble: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-20px)" },
        },
        slideRight: {
          "0%": { transform: "translateX(-20px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        slideLeft: {
          "0%": { transform: "translateX(20px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        pop: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "70%": { transform: "scale(1.05)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseShadow: {
          "0%": { boxShadow: "0 0 0 0 rgba(59, 130, 246, 0.4)" },
          "70%": { boxShadow: "0 0 0 10px rgba(59, 130, 246, 0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(59, 130, 246, 0)" },
        },
        slide: {
          "0%": { transform: "translateX(0%)" },
          "25%": { transform: "translateX(-25%)" },
          "50%": { transform: "translateX(-50%)" },
          "75%": { transform: "translateX(-25%)" },
          "100%": { transform: "translateX(0%)" },
        },
        hover: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        slideTransition: {
          "0%": { transform: "scale(0.98) translateY(2px)", opacity: "0.8" },
          "50%": { transform: "scale(1.01)", opacity: "0.9" },
          "100%": { transform: "scale(1) translateY(0)", opacity: "1" },
        },
        
      },
    },
  },
  plugins: [],
};
