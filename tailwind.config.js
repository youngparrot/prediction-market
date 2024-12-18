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
        primary: "#00BFFF", // Deep Sky Blue
        secondary: "#2A2E35", // Dark Grayish-Blue
        highlight: "#C6DAF7", // Light Blue
        background: "#121417", // Near Black
        metallic: "#8896A6", // Gray/Metallic
      },
      backgroundImage: {
        "hero-gradient": "linear-gradient(to bottom, #2A2E35, #121417)",
      },
    },
  },
  plugins: [],
};
