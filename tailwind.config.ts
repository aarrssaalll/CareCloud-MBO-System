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
        primary: {
          DEFAULT: '#004E9E',
          50: '#E6F2FF',
          100: '#CCE5FF',
          200: '#99CBFF',
          300: '#66B1FF',
          400: '#3397FF',
          500: '#007BFF',
          600: '#004E9E',
          700: '#003D7A',
          800: '#002C56',
          900: '#001B32'
        },
        secondary: {
          DEFAULT: '#007BFF',
          50: '#E6F2FF',
          100: '#CCE5FF',
          200: '#99CBFF',
          300: '#66B1FF',
          400: '#3397FF',
          500: '#007BFF',
          600: '#0056CC',
          700: '#004299',
          800: '#002E66',
          900: '#001A33'
        },
        accent: {
          DEFAULT: '#F5F7FA',
          50: '#FFFFFF',
          100: '#F5F7FA',
          200: '#E9EDF2',
          300: '#DDE3EA',
          400: '#D1D9E2',
          500: '#C5CFDA',
          600: '#B9C5D2',
          700: '#ADBACA',
          800: '#A1B0C2',
          900: '#95A6BA'
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
