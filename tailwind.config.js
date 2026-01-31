/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        success: "#22c55e",
        danger: "#ef4444",
        bg: "var(--bg)",
        "bg-card": "var(--bg-card)",
        text: "var(--text)",
        "text-muted": "var(--text-muted)",
        border: "var(--border)",
      },
      keyframes: {
        glowGreen: {
          "0%, 100%": { boxShadow: "0 0 10px rgba(34,197,94,0.4)" },
          "50%": { boxShadow: "0 0 25px rgba(34,197,94,0.9)" },
        },
        glowBlue: {
          "0%, 100%": { boxShadow: "0 0 10px rgba(59,130,246,0.4)" },
          "50%": { boxShadow: "0 0 25px rgba(59,130,246,0.9)" },
        },
        glowYellow: {
          "0%, 100%": { boxShadow: "0 0 10px rgba(251,191,36,0.4)" },
          "50%": { boxShadow: "0 0 25px rgba(251,191,36,0.9)" },
        },
        buzzerShake: {
          "0%, 100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-2px)" },
          "75%": { transform: "translateX(2px)" },
        },
      },
      animation: {
        "glow-green": "glowGreen 1.5s ease-in-out infinite",
        "glow-blue": "glowBlue 1.5s ease-in-out infinite",
        "glow-yellow": "glowYellow 1.5s ease-in-out infinite",
        "buzzer-shake": "buzzerShake 0.3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
