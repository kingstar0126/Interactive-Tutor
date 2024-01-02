import { useLocation } from "react-router-dom";
import Logo from "../assets/logo.png";
import { SERVER_URL } from "../config/constant";

const Header = () => {
    let location = useLocation();

    return (
        <div className="w-full py-10 flex font-logo">
            {(location.pathname === "/" || location.pathname === "/login" || location.pathname === "/resetpassword" || location.pathname === "/register" || location.pathname === "/changepassword" || location.pathname === "/chatbot/share/url" || location.pathname === "/thankyou" ) && (
                <div className="flex items-center justify-center w-full px-16">
                    <div className="flex">
                        <a href="/">
                            <img
                                src={`${SERVER_URL}${Logo}`}
                                className="w-[100px] h-full "
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
