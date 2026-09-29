/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        // Brand name / display
        brand: ['Nunito', ...defaultTheme.fontFamily.sans],
        // Headings, subheadings and body
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        // Primary — #134E4A
        primary: {
          DEFAULT: '#134E4A',
          50: '#f0f7f6',
          100: '#dceceb',
          200: '#bbdad7',
          300: '#8dbcb7',
          400: '#5b9a95',
          500: '#2e7a74',
          600: '#134E4A',
          700: '#0f3d3a',
          800: '#0b2c2a',
          900: '#071e1d',
          950: '#040f0e',
        },
        // Secondary — #4ADE80
        secondary: {
          DEFAULT: '#4ADE80',
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ADE80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        // Accent — #A3E635
        accent: {
          DEFAULT: '#A3E635',
          50: '#f7fee7',
          100: '#ecfccb',
          200: '#d9f99d',
          300: '#bef264',
          400: '#A3E635',
          500: '#84cc16',
          600: '#65a30d',
          700: '#4d7c0f',
          800: '#3f6212',
          900: '#365314',
          950: '#1a2e05',
        },
        // Tertiary — #000000
        ink: {
          DEFAULT: '#000000',
          900: '#111827',
          700: '#374151',
          500: '#6b7280',
        },
        success: {
          DEFAULT: '#4ADE80',
          500: '#22c55e',
          600: '#16a34a',
        },
        warning: {
          DEFAULT: '#A3E635',
          500: '#84cc16',
          600: '#65a30d',
        },
        error: {
          DEFAULT: '#ef4444',
          500: '#ef4444',
          600: '#dc2626',
        },
      },
    },
  },
  plugins: [],
};
