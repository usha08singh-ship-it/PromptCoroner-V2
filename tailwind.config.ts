import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      "colors": {
        "surface-container-highest": "#37333d",
        "surface-container": "#211e27",
        "tertiary-fixed-dim": "#ffb869",
        "tertiary-container": "#ca801e",
        "secondary-fixed": "#d8e2ff",
        "tertiary-fixed": "#ffdcbb",
        "on-secondary-fixed-variant": "#004395",
        "secondary": "#adc6ff",
        "on-background": "#e7e0ed",
        "primary-fixed-dim": "#d0bcff",
        "surface-tint": "#d0bcff",
        "on-secondary": "#002e6a",
        "tertiary": "#ffb869",
        "surface-bright": "#3b3742",
        "error": "#ffb4ab",
        "on-secondary-fixed": "#001a42",
        "on-primary-fixed-variant": "#5516be",
        "on-tertiary-container": "#3f2300",
        "on-surface-variant": "#cbc3d7",
        "error-container": "#93000a",
        "outline-variant": "#494454",
        "on-primary": "#3c0091",
        "background": "#15121b",
        "surface": "#15121b",
        "on-tertiary": "#482900",
        "secondary-fixed-dim": "#adc6ff",
        "primary": "#d0bcff",
        "on-error": "#690005",
        "on-secondary-container": "#e6ecff",
        "primary-fixed": "#e9ddff",
        "surface-container-high": "#2c2832",
        "surface-container-lowest": "#0f0d15",
        "on-tertiary-fixed-variant": "#673d00",
        "on-tertiary-fixed": "#2c1700",
        "on-surface": "#e7e0ed",
        "on-error-container": "#ffdad6",
        "inverse-surface": "#e7e0ed",
        "on-primary-fixed": "#23005c",
        "on-primary-container": "#340080",
        "surface-variant": "#37333d",
        "inverse-primary": "#6d3bd7",
        "surface-container-low": "#1d1a23",
        "surface-dim": "#15121b",
        "inverse-on-surface": "#322f39",
        "secondary-container": "#0566d9",
        "outline": "#958ea0",
        "primary-container": "#a078ff"
      },
      "borderRadius": {
        "DEFAULT": "0.125rem",
        "lg": "0.25rem",
        "xl": "0.5rem",
        "full": "0.75rem"
      },
      "spacing": {
        "xl": "2.5rem",
        "container-max": "1440px",
        "xs": "0.25rem",
        "gutter": "24px",
        "sm": "0.5rem",
        "lg": "1.5rem",
        "base": "4px",
        "md": "1rem"
      },
      "fontFamily": {
        "label-code": ["JetBrains Mono", "monospace"],
        "body-sm": ["Inter", "sans-serif"],
        "body-md": ["Inter", "sans-serif"],
        "headline-lg-mobile": ["Geist", "sans-serif"],
        "headline-lg": ["Geist", "sans-serif"],
        "display-lg": ["Geist", "sans-serif"],
        "sans": ["Inter", "sans-serif"],
      },
      "fontSize": {
        "label-code": ["12px", { "lineHeight": "16px", "letterSpacing": "0.05em", "fontWeight": "500" }],
        "body-sm": ["14px", { "lineHeight": "20px", "fontWeight": "400" }],
        "body-md": ["16px", { "lineHeight": "24px", "fontWeight": "400" }],
        "headline-lg-mobile": ["24px", { "lineHeight": "32px", "fontWeight": "600" }],
        "headline-lg": ["32px", { "lineHeight": "40px", "letterSpacing": "-0.01em", "fontWeight": "600" }],
        "display-lg": ["48px", { "lineHeight": "56px", "letterSpacing": "-0.02em", "fontWeight": "700" }]
      }
    }
  },
  plugins: [],
};
export default config;
