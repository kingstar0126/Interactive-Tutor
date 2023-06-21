import { BsFillChatLeftTextFill, BsPlus } from "react-icons/bs";
import { useState, useEffect } from "react";
import Chatmodal from "./Chatmodal";
import ChatTable from "./ChatTable";
import { useSelector } from "react-redux";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { webAPI } from "../utils/constants";

const Chat = () => {
  const notification = (type, message) => {
    // To do in here
    if (type === "error") {
      toast.error(message);
    }
    if (type === "success") {
      toast.success(message);
    }
  };
  const [chat, SetChat] = useState([]);
  const user = useSelector((state) => state.user.user);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleOk = (data) => {
    axios.post(webAPI.addchat, data).then((res) => {
      if (!res.data.success) notification("error", res.data.message);
      else {
        notification("success", res.data.message);
        getChats();
      }
    });
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    getChats();
  }, []);
  const getChats = () => {
    axios.get(webAPI.getchats).then((res) => {
      SetChat(res.data.data);
    });
  };

  return (
    <div className="p-4 ml-5 mr-10">
      <Toaster />
      <div className="flex justify-between w-full p-2">
        <div className="flex items-center justify-center gap-2 font-semibold text-[20px]">
          <BsFillChatLeftTextFill />
          Chats
        </div>
        <div className="flex items-center justify-center gap-5">
          <div className="bg-[--site-main-color9] rounded-full py-[1px] px-[5px] items-center justify-center text-[10px] text-[--site-main-color3]">
            Active subscription: Free
          </div>
          <div className="bg-[--site-main-color7] rounded-full py-[1px] px-[5px] items-center justify-center text-[10px] text-[--site-main-color3]">
            30 queries available for this month
          </div>
        </div>
      </div>
      <div className="flex flex-col w-full">
        <div className="flex flex-col items-start justify-center w-full gap-3 p-5 bg-white rounded-2xl">
          <p className="text-[20px] font-semibold">Hello, {user}!</p>
          <p className="text-[14px]">
            Welcome to here! To get started, the first step is to create a
            widget, which can be either a chatbot (chats) or a toolbot (tools).
            Once you've created your first widget, you'll be redirected to the
            details page, where you'll have access to multiple tabs for
            customization and management.
          </p>
          <p className="text-[14px]">Let's take a closer look at each tab:</p>
          <p className="text-[14px]">
            <span className="font-bold">Preview Tab:</span> In this tab, you can
            see a preview of your widget as a chat window. It provides two
            buttons: "Open" to preview the widget in full-page mode and "Embed"
            to obtain the necessary code for integrating the widget into your
            website or app.
          </p>
          <p className="text-[14px]">
            <span className="font-bold">Branding Tab:</span> In this tab, you
            can customize various aspects of your widget's interface. You have
            the freedom to change texts, colors, images, notifications,
            information cards, buttons, and more. Every element of the interface
            can be configured to align with your desired branding.
          </p>
          <p className="text-[14px]">
            <span className="font-bold">Training Data Tab:</span> In this tab,
            you can train your widget. You have the option to choose from three
            types of data sources: URLs, files, or texts. Each data source
            allows you to input relevant information to initiate the training
            process. This step is crucial for optimizing your widget's
            performance and accuracy. website or app.
          </p>
          <p className="text-[14px]">
            <span className="font-bold">Conversation Explorer Tab:</span> In
            this tab, you can see all the conversations your widget has had. It
            stores and organizes the interactions, making it easier for you to
            review and analyze the conversations with your users. This
            information can provide valuable insights and help improve the
            effectiveness of your widget.
          </p>
          <p className="text-[14px]">
            By utilizing these tabs, you can create, customize, train, and
            manage your widget effectively, ensuring a seamless and engaging
            experience for your users.
          </p>
        </div>
        <div className="flex justify-end w-full py-2 ">
          <button
            type="button"
            onClick={showModal}
            className="text-white bg-[#4285F4] hover:bg-[#4285F4]/90 focus:ring-4 focus:outline-none focus:ring-[#4285F4]/50 font-medium rounded-xl text-sm px-2 py-1 text-center inline-flex items-center dark:focus:ring-[#4285F4]/55"
          >
            <BsPlus className="w-[30px] h-[30px] text-xl pointer-events-none" />
            Add chat
          </button>
        </div>
        <div>
          <ChatTable chat={chat} handledelete={getChats} />
        </div>
        <Chatmodal
          open={isModalOpen}
          handleOk={handleOk}
          handleCancel={handleCancel}
        />
      </div>
    </div>
  );
};

export default Chat;
