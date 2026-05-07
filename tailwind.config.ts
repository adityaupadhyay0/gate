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
        jakarta: ["var(--font-jakarta)", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#f0f4ff",
          100: "#e0e9fe",
          200: "#c7d7fe",
          300: "#a5bcfd",
          400: "#8199fa",
          500: "#636ff4",
          600: "#4f52e9",
          700: "#4242d5",
          800: "#3938ad",
          900: "#333389",
          950: "#1e1e4f",
        },
        emerald: {
          500: "#10b981",
          600: "#059669",
        }
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "mesh": "url('/mesh-gradient.png')",
      },
      boxShadow: {
        'premium': '0 0 50px -12px rgba(0, 0, 0, 0.12)',
        'glow': '0 0 20px -5px rgba(99, 111, 244, 0.3)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        }
      }
    },
  },
  plugins: [],
};
export default config;
