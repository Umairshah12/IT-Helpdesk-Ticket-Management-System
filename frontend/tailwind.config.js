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
        navy: {
          900: '#0b1323',
          800: '#14213D',
          700: '#1e294b',
          600: '#2c3b63',
        },
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563EB',
          700: '#1d4ed8',
        },
        sidebar: {
          bg: '#14213D',
          hover: '#1e2d4f',
          active: '#2563EB',
          text: '#94A3B8',
          textActive: '#FFFFFF',
        },
        surface: {
          light: '#FFFFFF',
          dark: '#0F172A',
          cardDark: '#1E293B',
          bgLight: '#F8FAFC',
          bgDark: '#0B1120',
          borderLight: '#E2E8F0',
          borderDark: '#334155',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'modal': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
}

