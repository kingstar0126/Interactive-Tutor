import React from "react";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-no-repeat bg-cover bg-[--site-card-icon-color]">
      <h1 className="text-white text-7xl font-bold mb-5 drop-shadow-lg">404</h1>
      <h2 className="text-white text-3xl font-semibold mb-3 drop-shadow-lg">
        Uh Oh! It looks like you are lost.
      </h2>
      <p className="text-white text-lg text-center mb-8 drop-shadow-lg">
        The page you are looking for doesn't exist or has been moved. But let's
        take you back to safety.
      </p>
      <a
        href="/"
        className="px-6 py-4 rounded-md bg-[--site-logo-text-color] text-[--site-card-icon-color] hover:bg-[--site-success-text-color] hover:text-[--site-logo-text-color] transition-colors ease-in-out duration-300"
      >
        Go back home
      </a>
    </div>
  );
};

export default NotFound;
