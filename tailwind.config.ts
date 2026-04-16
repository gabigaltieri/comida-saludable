import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        sage: {
          50: "#f4f7f4",
          100: "#e8efe8",
          200: "#c9d9c9",
          300: "#a3bda3",
          400: "#769b76",
          500: "#547d54",
          600: "#3f6340",
          700: "#334f34",
          800: "#2a402b",
          900: "#233524",
        },
        salmon: {
          50: "#fdf5f3",
          100: "#fce9e4",
          200: "#f9d0c5",
          300: "#f4ae9c",
          400: "#ec8169",
          500: "#e05d44",
          600: "#cc4330",
          700: "#ab3426",
          800: "#8d2e23",
          900: "#752a22",
        },
        cream: {
          50: "#fefdfb",
          100: "#fdf9f3",
          200: "#f9f0e2",
          300: "#f3e4c8",
          400: "#ebd4a8",
          500: "#e0c080",
        },
      },
      fontFamily: {
        serif: ["var(--font-cormorant)", "Georgia", "serif"],
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-cormorant)", "serif"],
      },
      backgroundImage: {
        "noise": "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E\")",
      },
      animation: {
        "float": "float 6s ease-in-out infinite",
        "marquee": "marquee 25s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
