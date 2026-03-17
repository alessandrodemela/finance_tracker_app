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
      backgroundImage: {
        "gradient-dark": "linear-gradient(180deg, #0a0c10 0%, #030305 100%)",
      },
      borderRadius: {
        'xl': '1rem', // 16px
        '2xl': '1.5rem', // 24px
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glow': '0 0 20px rgba(59, 130, 246, 0.3)',
      },
      letterSpacing: {
        number: '0.02em',
      }
    },
  },
  plugins: [],
};
export default config;
