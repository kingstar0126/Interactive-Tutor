import { Link, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setlocation } from "../redux/actions/locationAction";
import Logo from "../assets/logo.png";

const Header = () => {
  let location = useLocation();
  const dispatch = useDispatch();
  setlocation(dispatch, location.pathname);

  return (
    <div className="w-full h-[129px] py-2 flex bg-[--site-main-color-home] font-logo">
      {location.pathname === "/" && (
        <div className="flex items-center justify-between w-full px-16">
          {/* Logo */}
          <div className="flex">
            <a href="/">
              <img src={Logo} className="w-[99px] h-full " alt="logo" />
            </a>
            <span className="flex flex-col h-[93px] w-[123px] font-logo py-2 justify-center">
              <span className="h-[54px] mt-2 text-[23px] font-semibold text-white leading-8">
                Interactive Tutor
              </span>
              <span className="text-[19px] font-thin text-[--site-logo-text-color]">
                powered by ai
              </span>
            </span>
          </div>
          {/* Navbar */}
          <div className="flex justify-center gap-6 px-5 bg-white rounded-full">
            <a
              className="p-5 font-medium text-black font-logo"
              href="#features"
            >
              Features
            </a>
            <a className="p-5 font-medium text-black font-logo" href="#pricing">
              Pricing
            </a>
            <Link
              className="px-5 w-full flex items-center my-3 font-semibold text-black font-logo text-[18px] border-[3px] rounded-full border-[--site-logo-text-color]"
              to="/login"
            >
              LOGIN
            </Link>
            <div className="px-5 flex items-center my-3 whitespace-nowrap text-[18px] rounded-full font-semibold text-black font-logo bg-[--site-logo-text-color]">
              <Link to="/register">Sign-up</Link>
            </div>
          </div>
        </div>
      )}
      {location.pathname === "/login" && (
        <div className="flex items-center justify-between w-full px-16">
          {/* Logo */}
          <div className="flex">
            <a href="/">
              <img src={Logo} className="w-[99px] h-full " alt="logo" />
            </a>
            <span className="flex flex-col h-[93px] w-[123px] font-logo py-2 justify-center">
              <span className="h-[54px] mt-2 text-[23px] font-semibold text-white leading-8">
                Interactive Tutor
              </span>
              <span className="text-[19px] font-thin text-[--site-logo-text-color]">
                powered by ai
              </span>
            </span>
          </div>
          {/* Navbar */}
          <div className="flex justify-center gap-6 px-5 bg-white rounded-full">
            <Link
              className="px-5 w-full flex items-center my-3 font-semibold text-black font-logo text-[18px] border-[3px] rounded-full border-[--site-logo-text-color]"
              to="/login"
            >
              LOGIN
            </Link>
            <div className="px-5 flex items-center my-3 whitespace-nowrap text-[18px] rounded-full font-semibold text-black font-logo bg-[--site-logo-text-color]">
              <Link to="/register">Sign-up</Link>
            </div>
          </div>
        </div>
      )}{" "}
      {location.pathname === "/register" && (
        <div className="flex items-center justify-between w-full px-16">
          {/* Logo */}
          <div className="flex">
            <a href="/">
              <img src={Logo} className="w-[99px] h-full " alt="logo" />
            </a>
            <span className="flex flex-col h-[93px] w-[123px] font-logo py-2 justify-center">
              <span className="h-[54px] mt-2 text-[23px] font-semibold text-white leading-8">
                Interactive Tutor
              </span>
              <span className="text-[19px] font-thin text-[--site-logo-text-color]">
                powered by ai
              </span>
            </span>
          </div>
          {/* Navbar */}
          <div className="flex justify-center gap-6 px-5 bg-white rounded-full">
            <Link
              className="px-5 w-full flex items-center my-3 font-semibold text-black font-logo text-[18px] border-[3px] rounded-full border-[--site-logo-text-color]"
              to="/login"
            >
              LOGIN
            </Link>
            <div className="px-5 flex items-center my-3 whitespace-nowrap text-[18px] rounded-full font-semibold text-black font-logo bg-[--site-logo-text-color]">
              <Link to="/register">Sign-up</Link>
            </div>
          </div>
        </div>
      )}{" "}
      {location.pathname === "/resetpassword" && (
        <div className="flex items-center justify-between w-full px-16">
          {/* Logo */}
          <div className="flex">
            <a href="/">
              <img src={Logo} className="w-[99px] h-full " alt="logo" />
            </a>
            <span className="flex flex-col h-[93px] w-[123px] font-logo py-2 justify-center">
              <span className="h-[54px] mt-2 text-[23px] font-semibold text-white leading-8">
                Interactive Tutor
              </span>
              <span className="text-[19px] font-thin text-[--site-logo-text-color]">
                powered by ai
              </span>
            </span>
          </div>
          {/* Navbar */}
          <div className="flex justify-center gap-6 px-5 bg-white rounded-full">
            <Link
              className="px-5 w-full flex items-center my-3 font-semibold text-black font-logo text-[18px] border-[3px] rounded-full border-[--site-logo-text-color]"
              to="/login"
            >
              LOGIN
            </Link>
            <div className="px-5 flex items-center my-3 whitespace-nowrap text-[18px] rounded-full font-semibold text-black font-logo bg-[--site-logo-text-color]">
              <Link to="/register">Sign-up</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;
