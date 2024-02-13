import { type Config } from 'tailwindcss';
// import defaultTheme from 'tailwindcss/defaultTheme.js';

export default {
  content: ['./app/**/*.{ts,tsx,jsx,js}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
    },
  },
} satisfies Config;
