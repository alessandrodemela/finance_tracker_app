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
          navy: 'var(--color-brand-navy)',
          card: 'var(--color-brand-card)',
          primary: 'var(--color-brand-primary)',
          secondary: 'var(--color-brand-secondary)',
          success: 'var(--color-brand-success)',
          danger: 'var(--color-brand-danger)',
          accent: 'var(--color-brand-accent)',
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
