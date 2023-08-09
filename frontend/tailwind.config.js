/** @type {import('tailwindcss').Config} */
const withMT = require("@material-tailwind/react/utils/withMT");

module.exports = withMT({
    content: ["./src/**/*.{js,jsx,ts,tsx}"],
    theme: {
        extend: {},
        fontFamily: {
            default: ["poppins, sans-serif"],
            logo: ["raleway,sans-serif"],
        },
    },
    plugins: [],
});
