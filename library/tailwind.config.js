/** @type {import('tailwindcss').Config} */
const withMT = require("@material-tailwind/react/utils/withMT");
module.exports = withMT({
    content: ["./src/**/*.{html,js,jsx}"],
    theme: {
        extend: {},
        colors: {
            sitePrimary: "#12062E",
            tabHeader: "#252A41",
            primary: "#F2F6FF",
            footerPrimary: "#200C4D",
            chipColor: "#BFDBFE",
        },
        fontFamily: {
            default: ["Roboto"],
        },
    },
    plugins: [],
});
