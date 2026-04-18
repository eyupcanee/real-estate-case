// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: "#121212",
          surface: "#1A1A1A",
          primary: "#FFDA85",
          muted: "#8C8C8C",
        },
      },
    },
  },
  plugins: [],
};
