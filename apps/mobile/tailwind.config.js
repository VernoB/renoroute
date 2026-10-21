const jiti = require('jiti')(__filename, { interopDefault: true });
const { borderRadius, colors, fontFamily, fontSize, spacing } = jiti('./src/theme/tokens.ts');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors,
      fontFamily,
      fontSize,
      spacing,
      borderRadius,
    },
  },
};
