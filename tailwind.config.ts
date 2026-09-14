import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          50: '#F0F9FF',
          100: '#E0F2FE',
          200: '#BAE6FD',
          300: '#7DD3FC',
          400: '#38BDF8',
          500: '#0EA5E9',
          600: '#0284C7',
          700: '#0369A1',
          800: '#075985',
          900: '#0C4A6E',
        },
        cycle: {
          menstrual: "#F43F5E",       // Soft Coral/Rose
          "menstrual-light": "#FFE4E6",
          fertile: "#10B981",         // Mint / Soft Emerald
          "fertile-light": "#ECFDF5",
          ovulation: "#8B5CF6",       // Violet / Lavender
          "ovulation-light": "#F5F3FF",
          pms: "#F59E0B",             // Warm Amber / Peach
          "pms-light": "#FFFBEB",
          follicular: "#0EA5E9",      // Serene Sky Blue
          "follicular-light": "#E0F2FE"
        }
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'blue-glow': '0 10px 25px -5px rgba(14, 165, 233, 0.15), 0 8px 10px -6px rgba(14, 165, 233, 0.1)',
        'soft': '0 4px 20px -2px rgba(15, 23, 42, 0.05)',
      }
    },
  },
  plugins: [],
};
export default config;
