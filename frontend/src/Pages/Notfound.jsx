import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
    return (
        <div className="flex flex-col justify-center items-center bg-no-repeat bg-cover">
            <h1 className="mb-5 font-bold text-gray-600 text-7xl drop-shadow-lg">
                404
            </h1>
            <h2 className="mb-3 text-3xl font-semibold text-gray-500 drop-shadow-lg">
                Uh Oh! It looks like you are lost.
            </h2>
            <p className="mb-8 text-lg text-center text-gray-500 drop-shadow-lg">
                The page you are looking for doesn't exist or has been moved.
                But let's take you back to safety.
            </p>
            <Link
                to="/login"
                className="normal-case p-4 text-md rounded-md bg-[--site-main-Login1] text-[--site-file-upload]"
            >
                Go back Login
            </Link>
        </div>
    );
};

export default NotFound;
