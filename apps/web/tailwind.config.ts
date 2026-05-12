import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        yard: {
          primary: '#C2410C',
          rust: '#7C2D12',
          ink: '#1A1A1A',
          cream: '#FAF6EF',
          moss: '#3F6E47',
          fog: '#E7E0D3',
          sun: '#F59E0B',
        },
      },
    },
  },
  plugins: [],
};

export default config;
