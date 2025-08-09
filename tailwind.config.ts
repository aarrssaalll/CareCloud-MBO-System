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
            400: '#d2d0ce',
            500: '#c8c6c4',
            600: '#a19f9d',
            700: '#605e5c',
            800: '#323130',
            900: '#201f1e'
          },
          white: '#ffffff',
          error: '#d83b01',
          success: '#107c10',
          warning: '#ff8c00'
        },
        // Legacy support for existing components
        primary: {
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
        secondary: {
          DEFAULT: '#605e5c',
          50: '#faf9f8',
          100: '#f3f2f1',
          200: '#edebe9',
          300: '#e1dfdd',
          400: '#d2d0ce',
          500: '#c8c6c4',
          600: '#a19f9d',
          700: '#605e5c',
          800: '#323130',
          900: '#201f1e'
        },
        accent: {
          DEFAULT: '#f3f2f1',
          50: '#faf9f8',
          100: '#f3f2f1',
          200: '#edebe9',
          300: '#e1dfdd',
          400: '#d2d0ce',
          500: '#c8c6c4',
          600: '#a19f9d',
          700: '#605e5c',
          800: '#323130',
          900: '#201f1e'
        },
        text: {
          DEFAULT: '#333333',
          light: '#666666',
          lighter: '#999999'
        }
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;
