import { Link, useLocation } from "react-router-dom";
import Logo from "../assets/logo.png";
import { SERVER_URL } from "../config/constant";

const Header = () => {
    let location = useLocation();

    return (
        <div className="w-full h-[129px] py-2 flex bg-[--site-main-color-home] font-logo">
            {(location.pathname === "/" || location.pathname === "/login" )&& (
                <div className="flex items-center justify-center w-full px-16">
                    {/* Logo */}
                    <div className="flex">
                        <a href="/">
                            <img
                                src={`${SERVER_URL}${Logo}`}
                                className="w-[99px] h-full "
                                alt="logo"
                            />
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
                   
                </div>
            )}{" "}
            {location.pathname === "/register" && (
                <div className="flex items-center justify-center w-full px-16">
                    {/* Logo */}
                    <div className="flex">
                        <Link to="/">
                            <img
                                src={`${SERVER_URL}${Logo}`}
                                className="w-[99px] h-full "
                                alt="logo"
                            />
                        </Link>
                        <span className="flex flex-col h-[93px] w-[123px] font-logo py-2 justify-center">
                            <span className="h-[54px] mt-2 text-[23px] font-semibold text-white leading-8">
                                Interactive Tutor
                            </span>
                            <span className="text-[19px] font-thin text-[--site-logo-text-color]">
                                powered by ai
                            </span>
                        </span>
                    </div>
                </div>
            )}{" "}
            {location.pathname === "/changepassword" && (
                <div className="flex items-center justify-center w-full px-16">
                    {/* Logo */}
                    <div className="flex">
                        <Link to="/">
                            <img
                                src={`${SERVER_URL}${Logo}`}
                                className="w-[99px] h-full "
                                alt="logo"
                            />
                        </Link>
                        <span className="flex flex-col h-[93px] w-[123px] font-logo py-2 justify-center">
                            <span className="h-[54px] mt-2 text-[23px] font-semibold text-white leading-8">
                                Interactive Tutor
                            </span>
                            <span className="text-[19px] font-thin text-[--site-logo-text-color]">
                                powered by ai
                            </span>
                        </span>
                    </div>
                    
                </div>
            )}{" "}
            {location.pathname === "/resetpassword" && (
                <div className="flex items-center justify-center w-full px-16">
                    {/* Logo */}
                    <div className="flex">
                        <Link to="/">
                            <img
                                src={`${SERVER_URL}${Logo}`}
                                className="w-[99px] h-full "
                                alt="logo"
                            />
                        </Link>
                        <span className="flex flex-col h-[93px] w-[123px] font-logo py-2 justify-center">
                            <span className="h-[54px] mt-2 text-[23px] font-semibold text-white leading-8">
                                Interactive Tutor
                            </span>
                            <span className="text-[19px] font-thin text-[--site-logo-text-color]">
                                powered by ai
                            </span>
                        </span>
                    </div>
                   
                </div>
            )}
            {location.pathname === "/chatbot/share/url" && (
                <div className="flex items-center justify-center w-full px-16">
                    {/* Logo */}
                    <div className="flex">
                        <Link to="/">
                            <img
                                src={`${SERVER_URL}${Logo}`}
                                className="w-[99px] h-full "
                                alt="logo"
                            />
                        </Link>
                        <span className="flex flex-col h-[93px] w-[123px] font-logo py-2 justify-center">
                            <span className="h-[54px] mt-2 text-[23px] font-semibold text-white leading-8">
                                Interactive Tutor
                            </span>
                            <span className="text-[19px] font-thin text-[--site-logo-text-color]">
                                powered by ai
                            </span>
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Header;
