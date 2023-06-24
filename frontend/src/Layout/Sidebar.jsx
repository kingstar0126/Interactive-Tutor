import { Link } from "react-router-dom";
import { ListItem, ListItemPrefix } from "@material-tailwind/react";
import {
  BsFillChatLeftTextFill,
  BsFillCreditCard2FrontFill,
} from "react-icons/bs";
import Logo from "../assets/logo.png";
import { useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setlocation } from "../redux/actions/locationAction";

const Sidebar = () => {
  let location = useLocation();
  const dispatch = useDispatch();
  setlocation(dispatch, location.pathname);

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="container flex items-center justify-center w-1/3 p-1 mt-5">
        <Link to="chat">
          <a href="/">
            <img src={Logo} className="w-[99px] h-full " alt="logo" />
          </a>
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
      </div>
    </div>
  );
};

export default Sidebar;
