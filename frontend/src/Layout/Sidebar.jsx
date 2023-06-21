import { Link } from "react-router-dom";
import { ListItem, ListItemPrefix } from "@material-tailwind/react";
import {
  BsFillChatLeftTextFill,
  BsFillCreditCard2FrontFill,
} from "react-icons/bs";

const Sidebar = () => {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="container flex items-center justify-center w-1/3 p-1 mt-5">
        <Link to="chat">
          <img
            src="https://insertchatgpt.com/wp-content/uploads/2023/03/cropped-logo.png.webp"
            className="w-[50px] h-[50px] min-w-[50px]"
            alt="logo"
          />
        </Link>
      </div>
      <div className="flex flex-col items-start justify-center py-5 mt-5">
        <Link to="chat" className="w-full">
          <ListItem className="p-2">
            <ListItemPrefix>
              <BsFillChatLeftTextFill className="w-5 h-5" />
            </ListItemPrefix>
            Chats
          </ListItem>
        </Link>
        <Link to="subscription" className="w-full">
          <ListItem className="p-2">
            <ListItemPrefix>
              <BsFillCreditCard2FrontFill className="w-5 h-5" />
            </ListItemPrefix>
            Subscriptions
          </ListItem>
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
