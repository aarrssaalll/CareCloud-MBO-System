import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Microsoft Fluent Design System Colors
        ms: {
          blue: {
            DEFAULT: '#0078d4',
            50: '#f0f8ff',
            100: '#e6f3ff',
            200: '#c7e4ff',
            300: '#a8d4ff',
            400: '#6ab7ff',
            500: '#2b88d8',
            600: '#0078d4',
            700: '#106ebe',
            800: '#005a9e',
            900: '#004578'
          },
          gray: {
            50: '#faf9f8',
            100: '#f3f2f1',
            200: '#edebe9',
            300: '#e1dfdd',
            400: '#c8c6c4',
            500: '#a19f9d',
            600: '#605e5c',
            700: '#484644',
            800: '#323130',
            900: '#201f1e'
          }
        },
        // CareCloud MBO Palette
        primary: '#004E9E',
        secondary: '#007BFF',
        background: '#FFFFFF',
        accent: '#F5F7FA',
        text: {
          dark: '#333333',
          DEFAULT: '#333333',
          light: '#666666'
        }
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      animation: {
        'fadeIn': 'fadeIn 0.3s ease-in-out',
        'slideDown': 'slideDown 0.3s ease-out',
        'scaleIn': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
