/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'tech-blue': '#2563eb',
        'china-red': '#dc2626',
        'data-purple': '#7c3aed',
        'algorithm-cyan': '#0891b2',
      },
      fontFamily: {
        'sans': ['Geist Sans', 'sans-serif'],
        'heading': ['Alibaba Sans', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

