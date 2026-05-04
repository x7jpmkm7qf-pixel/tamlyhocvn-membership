import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50:  '#eef2f7',
          100: '#d4dfed',
          200: '#a9bedb',
          300: '#7e9ec9',
          400: '#537db7',
          500: '#2e5ea0',
          600: '#1e3f7a',
          700: '#0f2744',
          800: '#091b30',
          900: '#040e1c',
        },
        gold: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Be Vietnam Pro', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
