/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0f0f0f",
        card: "#161618",
        border: "#27272a",
        accent: {
          DEFAULT: "#8b5cf6",
          hover: "#7c3aed",
          light: "#a78bfa"
        }
      }
    },
  },
  plugins: [],
};
