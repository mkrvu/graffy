import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#F5F3FF",
          100: "#EDE9FE",
          200: "#DDD6FE",
          300: "#C4B5FD",
          400: "#A78BFA",
          500: "#8B5CF6",
          600: "#7C3AED",
          700: "#6D28D9",
          800: "#5B21B6",
          900: "#4C1D95",
        },
        cyan: {
          50: "#ECFEFF",
          100: "#CFFAFE",
          200: "#A5F3FC",
          300: "#67E8F9",
          400: "#22D3EE",
          500: "#06B6D4",
          600: "#0891B2",
          700: "#0E7490",
          800: "#155E75",
          900: "#164E63",
        },
        gold: {
          50: "#FEFCE8",
          100: "#FEF9C3",
          200: "#FEF08A",
          300: "#FDE047",
          400: "#FACC15",
          500: "#EAB308",
          600: "#CA8A04",
          700: "#A16207",
          800: "#854D0E",
          900: "#90730C",
        },
        rad: {
          DEFAULT: "#CC1111",
          dark: "#8D0F21",
        },
        green: {
          game: "#1CBB18",
        },
      },
      backgroundImage: {
        "gradient-xp": "linear-gradient(90deg, #7C3AED 0%, #8B5CF6 25%, #A78BFA 50%, #22D3EE 75%, #06B6D4 100%)",
        "gradient-purple": "linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)",
        "gradient-cyan": "linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)",
        "gradient-gold": "linear-gradient(135deg, #FACC15 0%, #CA8A04 100%)",
        "gradient-card": "linear-gradient(135deg, #1E1B4B 0%, #1D2733 100%)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
        "float-up": "floatUp 1.5s ease-out forwards",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "bounce-soft": "bounceSoft 0.5s ease-out",
        "spin-slow": "spin 3s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.9)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        floatUp: {
          "0%": { opacity: "1", transform: "translateY(0)" },
          "60%": { opacity: "1" },
          "100%": { opacity: "0", transform: "translateY(-80px)" },
        },
        bounceSoft: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.05)" },
        },
      },
      boxShadow: {
        "glow-purple": "0 0 20px rgba(124, 58, 237, 0.4)",
        "glow-cyan": "0 0 20px rgba(6, 182, 212, 0.4)",
        "glow-gold": "0 0 20px rgba(234, 179, 8, 0.4)",
        "card-soft": "0 4px 24px rgba(0,0,0,0.12)",
        "card-strong": "0 8px 40px rgba(0,0,0,0.2)",
        "form-custom": "0 20px 60px rgba(0,0,0,0.3)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
    },
  },
  plugins: [],
}

export default config
