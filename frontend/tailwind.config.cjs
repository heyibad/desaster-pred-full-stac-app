/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#fff6e9",
          100: "#ffeacc",
          200: "#ffd39a",
          300: "#ffba66",
          400: "#ffa23f",
          500: "#ff8a1f",
          600: "#f36f08",
          700: "#c85704",
          800: "#9d4407",
          900: "#7e3a08"
        }
      }
    }
  },
  plugins: []
};
