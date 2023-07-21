import { BsDatabaseFillGear } from "react-icons/bs";

//! Sidebar icons
import { AiOutlineUser, AiOutlineTrophy } from "react-icons/ai";
import { PiUserCircleGearLight } from "react-icons/pi";
import { IoLogOutOutline } from "react-icons/io5";

import Logo from "../assets/logo.png";
import { useLocation, Link } from "react-router-dom";
import { setlocation } from "../redux/actions/locationAction";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { changeuser } from "../redux/actions/userAction";
import { useEffect } from "react";
import { SERVER_URL } from "../config/constant";
import { useState } from "react";

const Sidebar = () => {
    let location = useLocation();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [selection, setSelection] = useState(1);
    useEffect(() => {
        if (location) {
            setlocation(dispatch, location.pathname);
        }
    }, []);
    const user = JSON.parse(useSelector((state) => state.user.user));

    const handleLogout = () => {
        changeuser(dispatch, null);
        navigate("/login");
    };

    return (
        <div className="flex flex-col items-center justify-center">
            <div className="flex items-center justify-center w-3/5 p-2 mt-10">
                <Link to="chat">
                    <img
                        src={`${SERVER_URL}${Logo}`}
                        className="w-full h-auto"
                        alt="logo"
                    />
                </Link>
            </div>
            <div className="flex flex-col items-end justify-center w-full gap-3 px-3 mt-10">
                <Link
                    to="chat"
                    className="flex w-full gap-3 p-2 transition-colors duration-300 ease-in-out hover:bg-black hover:bg-opacity-25"
                    onClick={() => {
                        setSelection(1);
                    }}
                    style={{
                        color: selection === 1 ? "#c1ff72" : "#ffffff",
                    }}
                >
                    <AiOutlineUser className="w-7 h-7" />

                    <span className="flex items-end">Tutor</span>
                </Link>
                <Link
                    to="subscription"
                    className="flex w-full gap-3 p-2 transition-colors duration-300 ease-in-out hover:bg-black hover:bg-opacity-25"
                    onClick={() => {
                        setSelection(2);
                    }}
                    style={{
                        color: selection === 2 ? "#c1ff72" : "#ffffff",
                    }}
                >
                    <AiOutlineTrophy className="w-7 h-7" />
                    <span className="flex items-end">Subscriptions</span>
                </Link>
                {/* //Todo This is user manager page */}
                {user.role === 1 ? (
                    <Link
                        to="manager"
                        className="flex w-full gap-3 p-2 transition-colors duration-300 ease-in-out hover:bg-black hover:bg-opacity-25"
                        onClick={() => {
                            setSelection(3);
                        }}
                        style={{
                            color: selection === 3 ? "#c1ff72" : "#ffffff",
                        }}
                    >
                        <BsDatabaseFillGear className="w-7 h-7" />

                        <span className="flex items-end">Manager</span>
                    </Link>
                ) : null}
                <Link
                    to="account"
                    className="flex w-full gap-3 p-2 transition-colors duration-300 ease-in-out hover:bg-black hover:bg-opacity-25"
                    onClick={() => {
                        setSelection(4);
                    }}
                    style={{
                        color: selection === 4 ? "#c1ff72" : "#ffffff",
                    }}
                >
                    <PiUserCircleGearLight className="w-7 h-7" />
                    <span className="flex items-end">Account</span>
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
                        <IoLogOutOutline className="text-white w-7 h-7" />
                    </div>
                    <span className="flex items-center text-[--site-main-color3]">
                        Logout
                    </span>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
