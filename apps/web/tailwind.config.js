/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
          950: "#0c4a8c",
        },
        ink: {
          50: "#f8fafc",
          900: "#0f172a",
        },
      },
      fontFamily: {
        sans: [
          "DM Sans",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "sans-serif",
        ],
        display: ["Outfit", "DM Sans", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(15, 23, 42, 0.04)",
        lift: "0 4px 14px -4px rgba(15, 23, 42, 0.07)",
      },
      backgroundImage: {
        "hero-mesh":
          "radial-gradient(ellipse 120% 80% at 80% -20%, rgba(37, 99, 235, 0.35), transparent 50%), radial-gradient(ellipse 80% 60% at 10% 100%, rgba(12, 74, 140, 0.2), transparent 55%)",
      },
    },
  },
  plugins: [],
};
