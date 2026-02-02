/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#0F1115", // Midnight Black
                surface: "#181B21",    // Deep Charcoal
                "surface-light": "#22262E",
                primary: "#10B981",    // Neon Mint (Tailwind Emerald-500 equivalent)
                "primary-glow": "rgba(16, 185, 129, 0.5)",
                secondary: "#14B8A6",  // Electric Cyan (Tailwind Teal-500)
                accent: "#F59E0B",     // Warm Amber
                danger: "#EF4444",     // Neon Coral
                "text-primary": "#F8FAFC",
                "text-secondary": "#94A3B8",
                border: "#2D323E",
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            boxShadow: {
                'glow-primary': '0 0 20px -5px rgba(16, 185, 129, 0.4)',
                'glow-danger': '0 0 20px -5px rgba(239, 68, 68, 0.4)',
                'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'glass-gradient': 'linear-gradient(145deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)',
            },
        },
    },
    plugins: [],
}
