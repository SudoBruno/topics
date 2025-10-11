/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(0 0% 16%)",
        input: "hsl(0 0% 16%)",
        ring: "hsl(0 0% 96%)",
        background: "hsl(0 0% 4%)",
        foreground: "hsl(0 0% 96%)",
        primary: {
          DEFAULT: "hsl(0 0% 96%)",
          foreground: "hsl(0 0% 4%)",
        },
        secondary: {
          DEFAULT: "hsl(0 0% 10%)",
          foreground: "hsl(0 0% 96%)",
        },
        destructive: {
          DEFAULT: "hsl(0 62% 30%)",
          foreground: "hsl(0 0% 96%)",
        },
        muted: {
          DEFAULT: "hsl(0 0% 10%)",
          foreground: "hsl(0 0% 64%)",
        },
        accent: {
          DEFAULT: "hsl(0 0% 10%)",
          foreground: "hsl(0 0% 96%)",
        },
        popover: {
          DEFAULT: "hsl(0 0% 10%)",
          foreground: "hsl(0 0% 96%)",
        },
        card: {
          DEFAULT: "hsl(0 0% 10%)",
          foreground: "hsl(0 0% 96%)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
}
