import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";

const Header = () => {
  let location = useLocation();

  useEffect(() => {
    console.log(location);
  }, [location]);

  return (
    <div className="w-full h-[45px] drop-shadow-xl flex justify-center fixed top-0 z-50 bg-white/70 backdrop-blur-sm">
      {location.pathname === "/" && (
        <div className="w-5/6 h-[45px] flex items-center justify-between py-1">
          {/* Logo */}
          <div className="w-1/5">
            <a href="/">
              <img
                src="https://insertchatgpt.com/wp-content/uploads/2023/03/cropped-logo.png.webp"
                className="w-[40px] h-[40px] "
                alt="logo"
              />
            </a>
          </div>
          {/* Navbar */}
          <div className="flex items-center justify-end py-1 pr-[50px] w-3/5 gap-6 xl:gap-8">
            <Link
              className="p-5 font-medium text-black font-default"
              to="#features"
            >
              Features
            </Link>
            <Link
              className="p-5 font-medium text-black font-default"
              to="#pricing"
            >
              Pricing
            </Link>
          </div>
          <div className="flex items-center w-1/5 py-1">
            <Link
              className="px-5 font-medium text-black font-default"
              to="/login"
            >
              Login
            </Link>
            <div className="px-5 py-[5px] rounded-lg font-medium text-white font-default bg-[--site-main-color4]">
              <Link to="/register">Register</Link>
            </div>
          </div>
        </div>
      )}
      {location.pathname === "/login" && (
        <div className="h-[45px] bg-[--site-main-color3] flex items-center justify-between">
          {/* Logo */}
          <div>
            <a href="/">
              <img
                src="https://insertchatgpt.com/wp-content/uploads/2023/03/cropped-logo.png.webp"
                className="w-[40px] h-[40px] "
                alt="logo"
              />
            </a>
          </div>
        </div>
      )}{" "}
      {location.pathname === "/register" && (
        <div className="h-[45px] bg-[--site-main-color3] flex items-center justify-between">
          {/* Logo */}
          <div>
            <a href="/">
              <img
                src="https://insertchatgpt.com/wp-content/uploads/2023/03/cropped-logo.png.webp"
                className="w-[40px] h-[40px] "
                alt="logo"
              />
            </a>
          </div>
        </div>
      )}{" "}
      {location.pathname === "/resetpassword" && (
        <div className="h-[45px] bg-[--site-main-color3] flex items-center justify-between">
          {/* Logo */}
          <div>
            <a href="/">
              <img
                src="https://insertchatgpt.com/wp-content/uploads/2023/03/cropped-logo.png.webp"
                className="w-[40px] h-[40px] "
                alt="logo"
              />
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;
