import { ListItem, ListItemPrefix } from "@material-tailwind/react";
import {
    BsDatabaseFillGear,
    BsFillChatLeftTextFill,
    BsFillCreditCard2FrontFill,
} from "react-icons/bs";
import { HiDocumentReport } from "react-icons/hi";
import { BiLogOut } from "react-icons/bi";
import { MdManageAccounts } from "react-icons/md";

import Logo from "../assets/logo.png";
import { useLocation, Link } from "react-router-dom";
import { setlocation } from "../redux/actions/locationAction";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { changeuser } from "../redux/actions/userAction";
import { useEffect } from "react";
import { SERVER_URL } from "../config/constant";

const Sidebar = () => {
    let location = useLocation();
    const dispatch = useDispatch();
    const navigate = useNavigate();
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
            <div className="container flex items-center justify-center w-1/3 p-1 mt-5">
                <Link to="chat">
                    <img src={`${SERVER_URL}${Logo}`} className="w-[99px] h-full " alt="logo" />
                </Link>
            </div>
            <div className="flex flex-col items-start justify-center py-5 mt-5">
                <Link to="chat" className="w-full text-white">
                    <ListItem className="p-2">
                        <ListItemPrefix>
                            <BsFillChatLeftTextFill className="w-5 h-5 fill-[--site-logo-text-color]" />
                        </ListItemPrefix>
                        Tutors
                    </ListItem>
                </Link>
                <Link to="subscription" className="w-full text-white">
                    <ListItem className="p-2">
                        <ListItemPrefix>
                            <BsFillCreditCard2FrontFill className="w-5 h-5 fill-[--site-logo-text-color]" />
                        </ListItemPrefix>
                        Subscriptions
                    </ListItem>
                </Link>
                {user.role === 1 ? (
                    <Link to="manager" className="w-full text-white">
                        <ListItem className="p-2">
                            <ListItemPrefix>
                                <BsDatabaseFillGear className="w-5 h-5 fill-[--site-logo-text-color]" />
                            </ListItemPrefix>
                            Manager
                        </ListItem>
                    </Link>
                ) : null}
                <Link to="account" className="w-full text-white">
                    <ListItem className="p-2">
                        <ListItemPrefix>
                            <MdManageAccounts className="w-5 h-5 fill-[--site-logo-text-color]" />
                        </ListItemPrefix>
                        Account
                    </ListItem>
                </Link>
                <Link to="report" className="w-full text-white">
                    <ListItem className="p-2">
                        <ListItemPrefix>
                            <HiDocumentReport className="w-5 h-5 fill-[--site-logo-text-color]" />
                        </ListItemPrefix>
                        Report
                    </ListItem>
                </Link>
            </div>
            
            <div className="fixed bottom-10 left-10">
                <div
                    className="flex items-center justify-center gap-2 hover:scale-110"
                    onClick={() => {
                        handleLogout();
                    }}
                >
                    <BiLogOut className="w-5 h-5 fill-[--site-logo-text-color]" />
                    <span className="text-[--site-main-color3]">Logout</span>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
