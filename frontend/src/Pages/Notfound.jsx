import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-no-repeat bg-cover bg-[--site-card-icon-color]">
            <h1 className="mb-5 font-bold text-white text-7xl drop-shadow-lg">
                404
            </h1>
            <h2 className="mb-3 text-3xl font-semibold text-white drop-shadow-lg">
                Uh Oh! It looks like you are lost.
            </h2>
            <p className="mb-8 text-lg text-center text-white drop-shadow-lg">
                The page you are looking for doesn't exist or has been moved.
                But let's take you back to safety.
            </p>
            <Link
                to="/login"
                className="px-6 py-4 rounded-md bg-[--site-logo-text-color] text-[--site-card-icon-color] hover:bg-[--site-success-text-color] hover:text-[--site-logo-text-color] transition-colors ease-in-out duration-300"
            >
                Go back Login
            </Link>
        </div>
    );
};

export default NotFound;
