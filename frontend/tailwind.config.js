/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/app/**/*.{js,ts,jsx,tsx}",
      "./src/components/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          primary: '#0070f3',
          'primary-dark': '#0051b3',
          secondary: '#ff4081',
          success: '#00c853',
          warning: '#ffab00',
          error: '#f44336',
        },
      },
    },
    plugins: [],
  }