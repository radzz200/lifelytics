/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy:    '#0A0E1A',
        teal:    '#00F5D4',
        amber:   '#F5A623',
        danger:  '#FF4D4F',
        // Semantic colors
        background: {
          light: '#F1F5F9',
          dark: '#0A0E1A',
        },
        surface: {
          light: '#FFFFFF',
          dark: '#111827',
        },
        text: {
          light: '#000000',
          dark: '#F1F5F9',
        },
        border: {
          light: '#CBD5E1',
          dark: '#1F2937',
        },
        card: {
          light: '#FFFFFF',
          dark: '#1F2937',
        }
      },
      fontFamily: {
        display: ['Sora', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}
