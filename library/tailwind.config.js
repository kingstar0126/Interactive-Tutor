/** @type {import('tailwindcss').Config} */
const withMT = require("@material-tailwind/react/utils/withMT");
module.exports = withMT({
    content: ["./src/**/*.{html,js,jsx}"],
    theme: {
        extend: {},
        colors: {
            primary: "#F2F6FF",
            footerPrimary: "#200C4D",
        },
        fontFamily: {
            default: ["Roboto"],
        },
    },
    plugins: [],
});
