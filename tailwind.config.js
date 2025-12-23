/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    fontFamily: {
      sans: ["Inter", "ui-sans-serif", "system-ui"],
      serif: ["Playfair Display", "ui-serif", "Georgia"],
      mono: ["ui-monospace", "SFMono-Regular"],
    },
    extend: {
      colors: {
        brand: {
          DEFAULT: "#1F4D3E", // deep green
          dark: "#163C30",
          light: "#C8A165", // gold accent
          mist: "#E8EDEB", // soft neutral
        },
        neutral: {
          50: "#FAFAF9",
          100: "#F4F4F4",
          200: "#E6E6E6",
          300: "#D6D6D6",
          800: "#333333",
        },
      },

      // ✨ Animations & Keyframes
      keyframes: {
        fadeIn: {
          "0%": { opacity: 0, transform: "translateY(-4px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        fadeOut: {
          "0%": { opacity: 1, transform: "translateY(0)" },
          "100%": { opacity: 0, transform: "translateY(-4px)" },
        },
        scaleIn: {
          "0%": { opacity: 0, transform: "scale(0.96)" },
          "100%": { opacity: 1, transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.25s ease-in-out forwards",
        fadeOut: "fadeOut 0.2s ease-in-out forwards",
        scaleIn: "scaleIn 0.25s ease-in-out forwards",
        shimmer: "shimmer 2.5s infinite linear",
      },

      // 💎 Luxury Shadows
      boxShadow: {
        luxury: "0 8px 32px rgba(31, 77, 62, 0.1)",
        glow: "0 0 30px rgba(200, 161, 101, 0.25)",
        inset: "inset 0 1px 2px rgba(255, 255, 255, 0.2)",
      },

      // 🌫 Glassmorphism Effects
      backdropBlur: {
        xs: "2px",
        sm: "4px",
        md: "8px",
        xl: "12px",
      },
      backgroundImage: {
        "luxury-gradient":
          "linear-gradient(135deg, rgba(31,77,62,0.08), rgba(200,161,101,0.08))",
        "gold-hover":
          "linear-gradient(135deg, rgba(200,161,101,0.1), rgba(31,77,62,0.1))",
      },
      backgroundSize: {
        shimmer: "400% 100%",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

