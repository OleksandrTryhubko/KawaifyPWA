module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // важливо!
  theme: {
    extend: {
      colors: {
        kawaii: {
          light: '#ffe4f6',
          dark: '#1e1b4b'
        }
      }
    },
  },
  plugins: [],
};
