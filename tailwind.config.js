/** @type {import('tailwindcss').Config} */
import colors from 'tailwindcss/colors';

export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./context/**/*.{js,ts,jsx,tsx}",
    "./hooks/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // Semantic Palette - WCAG 2.1 AA Compliant
        primary: {
          DEFAULT: colors.teal[600], // Light
          dark: colors.teal[500],    // Dark
        },
        "primary-fg": {
          DEFAULT: colors.teal[50],  // Light
          dark: colors.teal[950],    // Dark
        },
        secondary: {
          DEFAULT: colors.indigo[600],
          dark: colors.indigo[400],
        },
        success: {
          DEFAULT: colors.emerald[600],
          dark: colors.emerald[400],
        },
        danger: {
          DEFAULT: colors.rose[600],
          dark: colors.rose[400],
        },
        warning: {
          DEFAULT: colors.amber[500],
          dark: colors.amber[400],
        },
        // Surfaces & Layout
        background: {
          DEFAULT: colors.zinc[900],  // Light equivalent to dark mode
          dark: colors.zinc[900],     // Dark
        },
        surface: {
          DEFAULT: colors.zinc[800],  // Light equivalent to dark mode
          dark: colors.zinc[800],     // Dark
        },
        "text-main": {
          DEFAULT: colors.zinc[100],  // Light
          dark: colors.zinc[100],     // Dark
        },
        "text-muted": {
          DEFAULT: colors.zinc[400],  // Light
          dark: colors.zinc[400],     // Dark
        },
        "border-color": {
          DEFAULT: colors.zinc[800],  // Light
          dark: colors.zinc[800],     // Dark
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 4px 20px -2px rgba(13, 148, 136, 0.25)',
      }
    },
  },
  plugins: [],
}