/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{ts,tsx}"],
    theme: {
      extend: {
        colors: {
          brand: {
            50: "#eef6ff",
            100: "#daeefe",
            200: "#bcdffd",
            300: "#91c6fb",
            400: "#60a5fa",
            500: "#3b82f6",
            600: "#2563eb",
            700: "#1d4ed8",
            800: "#1e40af",
            900: "#1e3a8a"
          }
        }
      },
    },
    plugins: [],
  }