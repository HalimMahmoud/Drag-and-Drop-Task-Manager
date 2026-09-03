import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0c66e4',
          foreground: '#ffffff',
        },
        background: '#f4f5f7',
        foreground: '#172b4d',
        card: '#ffffff',
        muted: {
          DEFAULT: '#f4f5f7',
          foreground: '#6b778c',
        },
        border: '#dfe1e6',
        ring: '#0c66e4',
      },
      borderRadius: {
        lg: '12px',
        md: '8px',
        sm: '6px',
      },
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'sans-serif',
        ],
      },
    },
  },
};

export default config;
