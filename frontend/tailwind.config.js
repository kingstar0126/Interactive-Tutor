/** @type {import('tailwindcss').Config} */
const withMT = require("@material-tailwind/react/utils/withMT");

module.exports = withMT({
    content: ["./src/**/*.{js,jsx,ts,tsx}"],
    theme: {
        extend: {
            backgroundColor: {
                primary: "var(--site-onboarding-primary-color)"
            },
            maxWidth: {
                "calc-267": "calc(100% - 267px)"
            }
        },
        fontFamily: {
            default: ["poppins, sans-serif"],
            logo: ["raleway,sans-serif"],
        },
    },
    plugins: [],
});
