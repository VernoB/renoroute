const jiti = require('jiti')(__filename, { interopDefault: true });
const { borderRadius, colors, elevation, fontFamily, fontSize, motion, spacing } =
  jiti('./src/theme/tokens.ts');

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
      boxShadow: elevation,
      transitionDuration: {
        fast: motion.fast,
        base: motion.base,
        slow: motion.slow,
      },
      transitionTimingFunction: {
        out: motion.easeOut,
      },
    },
  },
};
