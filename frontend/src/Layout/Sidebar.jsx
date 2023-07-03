import { Link } from "react-router-dom";
import { ListItem, ListItemPrefix } from "@material-tailwind/react";
import {
    BsDatabaseFillGear,
    BsFillChatLeftTextFill,
    BsFillCreditCard2FrontFill,
} from "react-icons/bs";

import Logo from "../assets/logo.png";
import { useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setlocation } from "../redux/actions/locationAction";
import { useSelector } from "react-redux";

const Sidebar = () => {
    let location = useLocation();
    const dispatch = useDispatch();
    setlocation(dispatch, location.pathname);
    const user = JSON.parse(useSelector((state) => state.user.user));

    return (
        <div className="flex flex-col items-center justify-center">
            <div className="container flex items-center justify-center w-1/3 p-1 mt-5">
                <Link to="chat">
                    <img src={Logo} className="w-[99px] h-full " alt="logo" />
                </Link>
            </div>
            <div className="flex flex-col items-start justify-center py-5 mt-5">
                <Link to="chat" className="w-full text-white">
                    <ListItem className="p-2">
                        <ListItemPrefix>
                            <BsFillChatLeftTextFill className="w-5 h-5 fill-[--site-logo-text-color]" />
                        </ListItemPrefix>
                        Chats
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
            </div>
        </div>
    );
};

export default Sidebar;
