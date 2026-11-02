/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          500: '#1b7a48',
          600: '#16693d',
          700: '#155e37',
          800: '#134e2c',
          900: '#113f24',
          950: '#092314',
        },
        fresh: {
          50: '#f2faf5',
          100: '#def3e5',
          200: '#bfe7ce',
          300: '#8ed5ad',
          400: '#56bc86',
          500: '#2d9f58',
          600: '#238246',
          700: '#1d6839',
        },
        cream: {
          50: '#fdfcf9',
          100: '#faf6ee',
          200: '#f4ede0',
          300: '#e8dcbe',
          400: '#dbc89a',
        },
        charcoal: {
          700: '#383d39',
          800: '#232724',
          900: '#171a18',
          950: '#0e110f',
        },
        harvest: {
          50: '#fffbeb',
          100: '#fef3c7',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02)',
        'card': '0 4px 20px -2px rgba(17, 63, 36, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        'elevated': '0 20px 30px -10px rgba(17, 63, 36, 0.12), 0 10px 15px -5px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
}
