import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#EBF3EC",
        espresso: "#1B3D2A",
        "text-primary": "#1A1A1A",
        "text-muted": "#4D6B55",
        "text-light": "#7A9B82",
        "accent-warm": "#3A7D44",
        rule: "#C2D6C6",
        "rule-light": "#D6E6D8",
      },
      fontFamily: {
        cinzel: ["Cinzel", "serif"],
        inter: ["Inter", "sans-serif"],
        newsreader: ["Newsreader", "serif"],
      },
      letterSpacing: {
        logo: "0.35em",
        nav: "0.18em",
        announcement: "0.12em",
        "section-heading": "0.35em",
        "product-name": "0.12em",
        "footer-heading": "0.2em",
        button: "0.15em",
      },
      spacing: {
        "page-x": "48px",
        "section-y": "80px",
        "component-gap": "32px",
        "nav-height": "56px",
        "announcement-height": "32px",
        "grid-gap": "24px",
      },
    },
  },
  plugins: [],
};

export default config;
