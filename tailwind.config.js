module.exports = {
  content: [
    './*.html',
    './content/**/*.html',
    './assets/js/**/*.js',
  ],
  theme: {
    extend: {},
  },
  plugins: [require('@tailwindcss/typography')],
};
