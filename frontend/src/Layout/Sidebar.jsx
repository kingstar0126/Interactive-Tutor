import { BsDatabaseFillGear } from "react-icons/bs";
//! Sidebar icons
import { AiOutlineUser, AiOutlineClose, AiOutlineTrophy } from "react-icons/ai";
import { PiUserCircleGearLight } from "react-icons/pi";
import { IoLogOutOutline } from "react-icons/io5";

import Logo from "../assets/logo.png";
import { useLocation, Link } from "react-router-dom";
import { setlocation } from "../redux/actions/locationAction";
import { useSelector, useDispatch } from "react-redux";
import { SERVER_URL } from "../config/constant";
import { webAPI } from "../utils/constants";
import { useState, useEffect } from "react";
import { setOpenSidebar } from "../redux/actions/locationAction";
import axios from "axios";

const Sidebar = () => {
    let location = useLocation();
    const redirections = ["chat", "subscription", "manager", "enterprise", "account"];
    const dispatch = useDispatch();
    const [check, setCheck] = useState(true);
    const [selection, setSelection] = useState(1);
    const [sidebarStyle, setSidebarStyle] = useState("");
    const user = JSON.parse(useSelector((state) => state.user.user));
    const isOpenSidebar = useSelector((state) => state.location.openSidebar);

    useEffect(() => {
        if (location) {
            setlocation(dispatch, location.pathname);
            setSidebarStyle(
                "md:flex hidden flex-col items-center justify-center"
            );
        }
        axios
            .post(webAPI.checkUserInvite, { id: user.id })
            .then(res => {
                if (res.data.success) {
                    setCheck(false)
                }
                else {
                    setCheck(true)
                }
            })
            .catch(err => console.error(err))
    }, []);

    const handleOpenSidebar = () => {
        dispatch(setOpenSidebar());
    };

    useEffect(() => {
        let url = location.pathname.split("/").slice(-1);
        let index = redirections.indexOf(url[0]) + 1;
        if (index) {
            setSelection(index);
        } else {
            let url = location.pathname.split("/").slice(-2, -1);
            let index = redirections.indexOf(url[0]) + 1;
            setSelection(index);
        }
    }, [location]);

    const handleLogout = () => {
        window.localStorage.clear();
        window.location.replace(window.location.origin + "/login");
    };

    useEffect(() => {
        if (isOpenSidebar) {
            setSidebarStyle(
                "md:flex fixed top-0 left-0 h-full w-[266px] flex-col items-center z-[9999] bg-[--site-card-icon-color] justify-start"
            );
        } else {
            setSidebarStyle(
                "md:flex hidden flex-col items-center justify-start"
            );
        }
    }, [isOpenSidebar]);

    return (
        <div className={sidebarStyle}>
            <div className="hidden md:flex items-center justify-center mt-[40px] mb-[50px] px-[78px]">
                <Link to="chat">
                    <img
                        src={`${SERVER_URL}${Logo}`}
                        className="w-full h-auto"
                        alt="logo"
                    />
                </Link>
            </div>
            <div className="flex justify-end p-5 md:hidden">
                <AiOutlineClose
                    className="w-5 h-5 text-white"
                    onClick={handleOpenSidebar}
                />
            </div>
            <div className="flex-col items-center justify-start w-full">
                <Link
                    to="chat"
                    className="flex w-full gap-4 px-6 py-4 transition-all duration-300 ease-in-out hover:bg-black hover:bg-opacity-25"
                    style={{
                        color: selection === 1 ? "#c1ff72" : "#ffffff",
                        fontWeight: selection === 1 ? 600 : 500,
                    }}
                >
                    <AiOutlineUser className="w-6 h-6" />

                    <span className="flex items-end text-base">Tutor</span>
                </Link>
                {check && <Link
                    to="subscription"
                    className="flex w-full gap-4 px-6 py-4 transition-all duration-300 ease-in-out hover:bg-black hover:bg-opacity-25"
                    style={{
                        color: selection === 2 ? "#c1ff72" : "#ffffff",
                        fontWeight: selection === 2 ? 600 : 500,
                    }}
                >
                    <AiOutlineTrophy className="w-6 h-6" />
                    <span className="flex items-end text-base ">
                        Subscriptions
                    </span>
                </Link>}
                {/* //Todo This is user manager page */}
                {user.role === 1 ? (
                    <Link
                        to="manager"
                        className="flex w-full gap-4 px-6 py-4 transition-all duration-300 ease-in-out hover:bg-black hover:bg-opacity-25"
                        style={{
                            color: selection === 3 ? "#c1ff72" : "#ffffff",
                            fontWeight: selection === 3 ? 600 : 500,
                        }}
                    >
                        <BsDatabaseFillGear className="w-6 h-6" />

                        <span className="flex items-end text-base ">
                            Manager
                        </span>
                    </Link>
                ) : user.role === 7 ? 
                <Link
                    to="enterprise"
                    className="flex w-full gap-4 px-6 py-4 transition-all duration-300 ease-in-out hover:bg-black hover:bg-opacity-25"
                    style={{
                        color: selection === 4 ? "#c1ff72" : "#ffffff",
                        fontWeight: selection === 4 ? 600 : 500,
                    }}
                >
                    <BsDatabaseFillGear className="w-6 h-6" />

                    <span className="flex items-end text-base ">
                        Enterprise
                    </span>
                </Link> : null}
                <Link
                    to="account"
                    className="flex w-full gap-4 px-6 py-4 transition-all duration-300 ease-in-out hover:bg-black hover:bg-opacity-25"
                    style={{
                        color: selection === 5 ? "#c1ff72" : "#ffffff",
                        fontWeight: selection === 5 ? 600 : 500,
                    }}
                >
                    <PiUserCircleGearLight className="w-6 h-6" />
                    <span className="flex items-end text-base ">Account</span>
                </Link>
            </div>

            <div className="fixed bottom-10 left-3">
                <div
                    className="flex w-full gap-3 p-2 hover:scale-110"
                    onClick={() => {
                        handleLogout();
                    }}
                >
                    <div className="w-7 h-7">
                        <IoLogOutOutline className="w-6 h-6 text-white" />
                    </div>
                    <span className="flex items-center text-[--site-main-color3] font-normal text-base">
                        Logout
                    </span>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
