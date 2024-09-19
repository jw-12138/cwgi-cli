import {
  scopedPreflightStyles,
  isolateForComponents,
} from 'tailwindcss-scoped-preflight';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: ['selector', '[data-mode="dark"]'],
  prefix: 'cwgi-',
  theme: {
    extend: {
      opacity: {
        5: '0.05',
      }
    },
  },
  plugins: [
    scopedPreflightStyles({
      isolationStrategy: isolateForComponents([
        '#cwgi_inner_box'
      ])
    })
  ],
}

