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
        primary: "#F9A825",
        secondary: "#000000",
        accent: "#FFECB3",
        neutral: "#4F4F4F",
        background: "#FFFFFF",
      },
      backgroundImage: {
        "hero-gradient": "linear-gradient(to bottom, #2A2E35, #121417)",
      },
    },
  },
  plugins: [],
};
