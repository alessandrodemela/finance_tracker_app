import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        brand: {
          navy: '#0A0E27',
          card: '#141B35',
          primary: '#E8EBF4',
          secondary: '#5A6B8F',
          success: '#10B981',
          danger: '#F05A64',
          accent: '#00D2FF',
        },
        // Keeping old variables for fallback/gradual migration, but these are the new ones
        background: "var(--background)",
        foreground: "var(--foreground)",
        surface: "var(--surface)",
        "surface-raised": "var(--surface-raised)",
        primary: {
          DEFAULT: "var(--primary)",
          hover: "var(--primary-hover)",
        },
        secondary: "var(--secondary)",
        accent: {
          income: "var(--accent-income)",
          expense: "var(--accent-expense)",
        },
        muted: "var(--muted)",
        label: "var(--label)",
        border: "var(--border)",
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
      },
    },
  },
  plugins: [],
};
export default config;
