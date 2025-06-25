/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        dark: '#0a0a0f',
        blue: '#3b82f6',
        purple: '#8b5cf6',
        pink: '#ec4899',
        white: '#f8fafc',
        gray: '#64748b',
        success: '#10b981',
        error: '#ef4444',
      },
    },
  },
  plugins: [],
}