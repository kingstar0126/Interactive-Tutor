import React, { useState } from "react";
import { AiOutlineTrophy, AiOutlineMenu } from "react-icons/ai";
import { setOpenSidebar } from "../redux/actions/locationAction";
import { useSelector, useDispatch } from "react-redux";
import Logo from "../assets/logo.png";
import { Drawer } from "@material-tailwind/react";
import Sidebar from "../Layout/Sidebar";

const Header = () => {
    const [openSidebar, setOpenSidebar] = useState(false);
    
    return (
        <div className="h-12 bg-primary flex gap-1 justify-between items-center px-5 md:hidden">
            <img src={Logo} alt="logo" className="w-10 h-10" />

            <AiOutlineMenu
                onClick={() => setOpenSidebar(true)}
                className="w-6 h-6 text-white m-3 cursor-pointer hover:text-gray-200"
            />
            <Drawer open={openSidebar} onClose={() => setOpenSidebar(false)} className="rounded-r-[10px] bg-primary w-[267px]">
                <Sidebar />
            </Drawer>
        </div>
    );
};

export default Header;
