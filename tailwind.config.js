/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        backdrop: "#0f1226",
        primary: "#8ab4ff",
        accent: "#ffd88a",
        glass: "rgba(255,255,255,0.08)",
        glass2: "rgba(255,255,255,0.12)",
      },
      boxShadow: {
        glass: "0 10px 30px rgba(0,0,0,0.25), inset 0 0 0 1px rgba(255,255,255,0.12)",
        glow: "0 0 20px rgba(138,180,255,0.35)",
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
