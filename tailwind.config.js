/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./context/**/*.{js,ts,jsx,tsx}",
    "./hooks/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: "#00897B", dark: "#2DD4BF" },
        secondary: { DEFAULT: "#D97706", dark: "#FBBF24" },
        background: { DEFAULT: "#F8FAFC", dark: "#0F172A" },
        surface: { DEFAULT: "#FFFFFF", dark: "#1E293B" },
        text: { 
          main: "#0F172A", "main-dark": "#F1F5F9",
          muted: "#64748B", "muted-dark": "#94A3B8" 
        },
        income: { DEFAULT: "#10B981", dark: "#34D399" },
        expense: { DEFAULT: "#F43F5E", dark: "#FB7185" }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 4px 20px -2px rgba(0, 137, 123, 0.25)',
      }
    },
  },
  plugins: [],
}