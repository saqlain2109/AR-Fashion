/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#FDFBF7',
          100: '#F8F2DE',
          200: '#EFE2BD',
          300: '#E4CF96',
          400: '#D4AF37',
          500: '#C59B27',
          600: '#A37D19',
          700: '#7F5E13',
          800: '#5C430E',
          900: '#3D2C09',
          950: '#1F1503',
        },
        noir: {
          800: '#18181B',
          850: '#121216',
          900: '#0D0D11',
          950: '#060608',
        },
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        sidebar: {
          dark: '#0F172A',
          darker: '#0B132B',
          accent: '#1E293B',
          border: '#334155',
        }
      },
    },
  },
  plugins: [],
};
