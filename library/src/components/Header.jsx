import React from "react";
import Logo from '../assets/logo.png'

const Header = () => {
    return (
      <div className="w-full shadow-md md:pl-[40px] p-1">
        <img src={Logo} alt="Logo" className="w-14 h-14"></img>
      </div>
    );
};

export default Header;
