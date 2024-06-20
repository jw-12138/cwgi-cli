import {
  scopedPreflightStyles,
  isolateForComponents,
} from 'tailwindcss-scoped-preflight';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    scopedPreflightStyles({
      isolationStrategy: isolateForComponents([
        '#cwgi_box'
      ])
    })
  ],
}

