import {
    BsFillChatLeftTextFill,
    BsPlus,
    BsFillCaretUpSquareFill,
    BsFillCaretDownSquareFill,
} from "react-icons/bs";
import { useState, useEffect } from "react";
import Chatmodal from "./Chatmodal";
import ChatTable from "./ChatTable";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { webAPI } from "../utils/constants";
import { useNavigate } from "react-router-dom";
import { Outlet, useLocation } from "react-router-dom";
import { getUserState } from "../redux/actions/userAction";
import { setquery } from "../redux/actions/queryAction";

const Chat = () => {
    const location = useLocation();
    const navigate = useNavigate();
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
    const user = JSON.parse(useSelector((state) => state.user.user));
    const query = useSelector((state) => state.query.query);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isOpen, setIsOpen] = useState(true);
    const [trial, setTrial] = useState(0);
    const [showDescription, setShowDescription] = useState("block");
    const dispatch = useDispatch();

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleOk = (data) => {
        data["user_id"] = user.id;
        axios.post(webAPI.addchat, data).then((res) => {
            if (!res.data.success) {
                notification("error", res.data.message);
            } else {
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
        if (isOpen) {
            setShowDescription(
                "flex flex-col items-start justify-center w-full gap-3 p-5 bg-[--site-card-icon-color] text-white mt-[10px] rounded-2xl"
            );
        } else {
            setShowDescription("hidden");
        }
    }, [isOpen]);

    useEffect(() => {
        getUserState(dispatch, { id: user.id });
        setquery(dispatch, user.query);
        if (user.role === 5) {
            setTrial(user.days);
            getChats();
        } else if (user.role === undefined || user.role === 0) {
            navigate("/chatbot/subscription");
        } else {
            getChats();
        }
    }, [location]);
    const getChats = () => {
        let data = {
            user_id: user.id,
        };

        axios.post(webAPI.getchats, data).then((res) => {
            console.log("This is the getChat", res);
            SetChat(res.data.data);
        });
    };

    return (
        <div className="p-4 pl-5 pr-10">
            <Toaster />
            <div className="flex items-center justify-between w-full p-5 bg-[--site-card-icon-color] rounded-full">
                <div className="flex items-center justify-center gap-2 font-semibold text-[20px] text-white">
                    <BsFillChatLeftTextFill className="fill-[--site-logo-text-color]" />
                    Chats
                </div>

                <div className="flex h-[20px] items-center justify-center">
                    {query && (
                        <p className="bg-[--site-logo-text-color] mr-4 px-2 rounded-xl flex gap-2 items-center justify-center">
                            Queries
                            <span className="text-[--site-error-text-color] font-bold">
                                {query}
                            </span>
                        </p>
                    )}
                    {trial > 0 && (
                        <p className="bg-[--site-logo-text-color] mr-4 px-2 rounded-xl flex gap-2 items-center justify-center">
                            Free trial
                            <span className="text-[--site-error-text-color] font-bold">
                                {trial}
                            </span>
                        </p>
                    )}
                    <button>
                        {isOpen ? (
                            <BsFillCaretUpSquareFill
                                onClick={() => setIsOpen(!isOpen)}
                                className="fill-[--site-logo-text-color] w-5 h-5 hover:scale-105"
                            />
                        ) : (
                            <BsFillCaretDownSquareFill
                                onClick={() => setIsOpen(!isOpen)}
                                className="fill-[--site-logo-text-color] w-5 h-5 hover:scale-105"
                            />
                        )}
                    </button>
                </div>
            </div>
            <div className="flex flex-col w-full">
                <div className={showDescription}>
                    <p className="text-[20px] font-semibold">
                        Hello, {user.username}!
                    </p>
                    <p className="text-[14px]">
                        Welcome to here! To get started, the first step is to
                        create a widget, which can be either a AI Tutor (chats).
                        Once you've created your first widget, you'll be
                        redirected to the details page, where you'll have access
                        to multiple tabs for customization and management.
                    </p>
                    <p className="text-[14px]">
                        Let's take a closer look at each tab:
                    </p>
                    <p className="text-[14px]">
                        <span className="font-bold">Preview Tab:</span> In this
                        tab, you can see a preview of your widget as a chat
                        window. It provides two buttons: "Open" to preview the
                        widget in full-page mode and "Embed" to obtain the
                        necessary code for integrating the widget into your
                        website or app.
                    </p>
                    <p className="text-[14px]">
                        <span className="font-bold">Branding Tab:</span> In this
                        tab, you can customize various aspects of your widget's
                        interface. You have the freedom to change texts, colors,
                        images, notifications, information cards, buttons, and
                        more. Every element of the interface can be configured
                        to align with your desired branding.
                    </p>
                    <p className="text-[14px]">
                        <span className="font-bold">Training Data Tab:</span> In
                        this tab, you can train your widget. You have the option
                        to choose from three types of data sources: URLs, files,
                        or texts. Each data source allows you to input relevant
                        information to initiate the training process. This step
                        is crucial for optimizing your widget's performance and
                        accuracy. website or app.
                    </p>
                    <p className="text-[14px]">
                        <span className="font-bold">
                            Conversation Explorer Tab:
                        </span>{" "}
                        In this tab, you can see all the conversations your
                        widget has had. It stores and organizes the
                        interactions, making it easier for you to review and
                        analyze the conversations with your users. This
                        information can provide valuable insights and help
                        improve the effectiveness of your widget.
                    </p>
                    <p className="text-[14px]">
                        By utilizing these tabs, you can create, customize,
                        train, and manage your widget effectively, ensuring a
                        seamless and engaging experience for your users.
                    </p>
                </div>
                {location.pathname === "/chatbot/chat" ? (
                    <div>
                        <div className="flex justify-end w-full py-2 ">
                            <button
                                type="button"
                                onClick={showModal}
                                className="text-[--site-logo-text-color] bg-[--site-card-icon-color] hover:bg-[--site-card-icon-color]/90 focus:ring-4 focus:outline-none focus:ring-[--site-card-icon-color]/50 font-medium rounded-xl text-sm px-2 py-1 text-center inline-flex items-center dark:focus:ring-[--site-card-icon-color]/55"
                            >
                                <BsPlus className="w-[30px] h-[30px] text-xl pointer-events-none" />
                                Add chat
                            </button>
                        </div>
                        <div className="w-full h-[500px] bg-[--site-main-color3] rounded-xl">
                            <ChatTable
                                chat={chat}
                                handledelete={getChats}
                                handleupdate={getChats}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="p-5 w-full mt-5 border-2 border-[--site-card-icon-color] bg-[--site-main-color3] rounded-2xl">
                        <Outlet />
                    </div>
                )}
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
