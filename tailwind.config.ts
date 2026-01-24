import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Claude/Anthropic Design System Colors
      colors: {
        // Primary brand colors (Claude's signature warm palette)
        claude: {
          bg: "#FAF9F7",           // Warm off-white background
          "bg-secondary": "#F5F4F0", // Slightly darker background
          "bg-tertiary": "#EEEDEA",  // Card backgrounds
          text: "#1A1915",         // Primary text - warm black
          "text-secondary": "#6B6963", // Secondary text
          "text-tertiary": "#9D9B94",  // Muted text
          border: "#E5E4E0",       // Subtle borders
          "border-strong": "#D1D0CC", // Stronger borders
        },
        // Accent colors
        accent: {
          coral: "#DA7756",        // Claude's coral/orange accent
          "coral-hover": "#C96A4A",
          "coral-light": "#FDF4F1",
          amber: "#D4A373",        // Warm amber
          sand: "#C9B99A",         // Sandy beige
        },
        // Semantic colors
        success: {
          DEFAULT: "#5D8A66",
          light: "#EDF5EF",
        },
        warning: {
          DEFAULT: "#D4A373",
          light: "#FDF8F3",
        },
        error: {
          DEFAULT: "#C75050",
          light: "#FDF2F2",
        },
      },
      fontFamily: {
        // Claude uses clean sans-serif typography
        sans: [
          "Söhne",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        mono: [
          "Söhne Mono",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "Liberation Mono",
          "Courier New",
          "monospace",
        ],
      },
      fontSize: {
        // Claude's typography scale
        xs: ["0.75rem", { lineHeight: "1.5" }],
        sm: ["0.875rem", { lineHeight: "1.5" }],
        base: ["1rem", { lineHeight: "1.6" }],
        lg: ["1.125rem", { lineHeight: "1.5" }],
        xl: ["1.25rem", { lineHeight: "1.4" }],
        "2xl": ["1.5rem", { lineHeight: "1.3" }],
        "3xl": ["1.875rem", { lineHeight: "1.25" }],
        "4xl": ["2.25rem", { lineHeight: "1.2" }],
        "5xl": ["3rem", { lineHeight: "1.1" }],
      },
      borderRadius: {
        claude: "0.5rem",         // Claude's subtle rounded corners
        "claude-lg": "0.75rem",
        "claude-xl": "1rem",
      },
      boxShadow: {
        claude: "0 1px 2px 0 rgba(26, 25, 21, 0.05)",
        "claude-md": "0 4px 6px -1px rgba(26, 25, 21, 0.05), 0 2px 4px -2px rgba(26, 25, 21, 0.05)",
        "claude-lg": "0 10px 15px -3px rgba(26, 25, 21, 0.05), 0 4px 6px -4px rgba(26, 25, 21, 0.05)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
