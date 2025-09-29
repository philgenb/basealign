/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        jakarta: ["Plus Jakarta Sans", "sans-serif"],
        montserrat: ["Montserrat", "sans-serif"],
        outfit: ["Outfit", "sans-serif"],
      },
      boxShadow: {
        card: "0 0 15px 0 rgba(123, 150, 232, 0.12)",
      },
      borderColor: {
        card: "#E5E7EB",
      },
      borderWidth: {
        card: "1px",
      },
      borderRadius: {
        card: "1rem",
      },
    },
  },
  plugins: [],
};
