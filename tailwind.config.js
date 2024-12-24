/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/templates/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#00539C", // Main blue color
          light: "#4A8CD6", // Lighter blue
          dark: "#00336A", // Darker blue
        },
        secondary: {
          DEFAULT: "#C0362C", // Main red color
          light: "#E0665F", // Lighter red
          dark: "#8A2722", // Darker red
        },
        background: {
          DEFAULT: "#000000", // Main black background
          light: "#1A1A1A", // Slightly lighter black
        },
        accent: {
          DEFAULT: "#F7C942", // Accent color (yellowish for contrast)
          light: "#FBE28E",
          dark: "#D1A933",
        },
      },
      backgroundImage: {
        "hero-gradient": "linear-gradient(to bottom, #2A2E35, #121417)",
      },
    },
  },
  plugins: [],
};
