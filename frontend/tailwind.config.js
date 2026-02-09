/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "rgb(var(--background) / <alpha-value>)",
                surface: "rgb(var(--surface) / <alpha-value>)",
                "surface-light": "rgb(var(--surface-light) / <alpha-value>)",
                primary: "rgb(var(--primary) / <alpha-value>)",
                "primary-glow": "rgba(16, 185, 129, 0.5)",
                secondary: "rgb(var(--secondary) / <alpha-value>)",
                accent: "#F59E0B",     // Warm Amber
                danger: "rgb(var(--danger) / <alpha-value>)",
                "text-primary": "rgb(var(--text-primary) / <alpha-value>)",
                "text-secondary": "rgb(var(--text-secondary) / <alpha-value>)",
                border: "rgb(var(--border) / <alpha-value>)",
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
