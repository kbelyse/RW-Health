export default {
    content: ["./index.html", "./src/**/*.{ts,tsx}"],
    theme: {
        extend: {
            colors: {
                bk: {
                    DEFAULT: "#0059B3",
                    dark: "#004a99",
                    light: "#e6f0fb",
                },
                brand: {
                    50: "#e6f0fb",
                    100: "#cce0f7",
                    200: "#99c7ef",
                    300: "#66ade7",
                    400: "#3393df",
                    500: "#0073d9",
                    600: "#0059B3",
                    700: "#004a99",
                    800: "#003d7a",
                    900: "#0a2744",
                    950: "#061a2e",
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
                glow: "0 0 80px -20px rgba(34, 211, 238, 0.45)",
                "glow-brand": "0 0 100px -30px rgba(37, 99, 235, 0.5)",
            },
            backgroundImage: {
                "hero-mesh": "radial-gradient(ellipse 120% 80% at 80% -20%, rgba(37, 99, 235, 0.45), transparent 50%), radial-gradient(ellipse 80% 60% at 10% 100%, rgba(12, 74, 140, 0.25), transparent 55%), radial-gradient(ellipse 60% 50% at 60% 80%, rgba(34, 211, 238, 0.12), transparent 45%)",
                "grid-faint": "linear-gradient(rgba(148, 163, 184, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(148, 163, 184, 0.08) 1px, transparent 1px)",
            },
            animation: {
                "gradient-x": "gradient-x 14s ease infinite",
                float: "float 8s ease-in-out infinite",
            },
            keyframes: {
                "gradient-x": {
                    "0%, 100%": { backgroundPosition: "0% 50%" },
                    "50%": { backgroundPosition: "100% 50%" },
                },
                float: {
                    "0%, 100%": { transform: "translateY(0)" },
                    "50%": { transform: "translateY(-10px)" },
                },
            },
        },
    },
    plugins: [],
};
