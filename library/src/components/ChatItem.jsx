import React from "react";
import { Avatar } from "@material-tailwind/react";
import { BsBookmarkFill } from "react-icons/bs";

const ChatItem = (props) => {
  const chat = props.data;
  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (
        ((num / 1000000).toFixed(1).replace(/\.0$/, "") * 1).toLocaleString() +
        "M"
      );
    } else if (num >= 1000) {
      return (
        ((num / 1000).toFixed(1).replace(/\.0$/, "") * 1).toLocaleString() + "K"
      );
    } else {
      return num.toLocaleString();
    }
  };

  const getSubMenus = (menu) => {
    if (menu === 1) {
      return "Role";
    } else if (menu === 2) {
      return "Subject";
    } else if (menu === 3) {
      return "Task";
    } else {
      return "Just For Fun";
    }
  };

  return (
    <div className="w-full rounded-md flex flex-col shadow-lg px-4 py-2 gap-2 hover:cursor-pointer">
      <div className="w-full h-[15rem] overflow-hidden">
        <img
          src={chat.chat_logo.url || chat.chat_logo.ai}
          alt="Logo"
          className="w-full h-full rounded-md object-cover"
        />
      </div>
      <div className="flex flex-wrap gap-2 h-[4rem] py-2 items-center">
        <span className="px-2 rounded-full bg-chipColor h-5 flex items-center justify-center">
          {getSubMenus(chat.menu)}
        </span>
      </div>
      <span className="font-bold text-xl">{chat.label}</span>
      <span className="h-10 truncate">{chat.description}</span>
      {chat.status ? (
        <div className="flex gap-2 items-center">
          <Avatar src={chat.url} alt="avatar" className="w-8 h-8" />
          <span className="flex gap-1">
            {chat.username}, <i>{chat.userrole}</i>
          </span>
        </div>
      ) : (
        <div className="flex gap-2 items-center">
          <Avatar src={chat.chat_logo.user} alt="avatar" className="w-8 h-8" />
          <span>{chat.name}</span>
        </div>
      )}
      <div className="flex gap-2 items-center">
        <BsBookmarkFill className="text-yellow-700" />
        <span>{formatNumber(chat.downloads)}</span>
      </div>
    </div>
  );
};

export default ChatItem;
