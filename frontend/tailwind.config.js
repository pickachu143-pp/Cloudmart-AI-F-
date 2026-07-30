/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef4ff",
          100: "#dbe7ff",
          200: "#b8cfff",
          300: "#8aaeff",
          400: "#5c86ff",
          500: "#3661fd",
          600: "#1f43e0",
          700: "#1a35b3",
          800: "#182f8f",
          900: "#182b70",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 6px 24px rgba(15, 23, 42, 0.08)",
      },
    },
  },
  plugins: [],
};
