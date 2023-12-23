import { BiCheckCircle } from "react-icons/bi";
import BrandingTextItem from "./BrandingTextItem";
import { useSelector, useDispatch } from "react-redux";
import { getchat, updatechatbot } from "../redux/actions/chatAction";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { webAPI } from "../utils/constants";
import BubbleItem from "./Branding/Bubble/BubbleItem";
import NotificationBubble from "./Branding/Bubble/NotificationBubble";
import LogoBranding from "./Branding/Images/LogoBranding";
import UserAvatarBranding from "./Branding/Images/UserAvatarBranding";
import AIAvatarBranding from "./Branding/Images/AIAvatarBranding";
import AIMessage from "./Branding/Message/AIMessage";
import BackgroundColor from "./Branding/Message/BackgroundColor";
import UserMessage from "./Branding/Message/UserMessage";
import ButtonBranding1 from "./Branding/Button/ButtonBranding1";
import { Button } from "@material-tailwind/react";

const Branding = () => {
    const dispatch = useDispatch();
    const chatState = useSelector((state) => state.chat.chat);
    const chat = (chatState && JSON.parse(chatState)) || {};
    const user = JSON.parse(useSelector((state) => state.user.user));
    const current_chat = chat;

    const notification = (type, message) => {
        // To do in here
        if (type === "error") {
            toast.error(message);
        }
        if (type === "success") {
            toast.success(message);
        }
    };

    const handleConfirm = () => {
        axios
            .post(webAPI.send_branding, current_chat)
            .then((res) => {
                getchat(dispatch, current_chat);
                updatechatbot(dispatch, true);
                notification("success", res.data.message);
            })
            .catch((err) => console.log(err));
    };
    return (
        <>
            {chat.access && (
                <div className="flex flex-col w-full h-full pb-5">
                    <Toaster className="z-30"/>

                    <div className="flex flex-col gap-8">
                        <div
                            name="Title"
                            className="border-[--site-chat-header-border] border rounded-xl w-full p-5 gap-4 flex flex-col text-base text-black shadow-xl shadow-[--site-chat-header-border]"
                        >
                            <div className="flex justify-between">
                                <h1>Texts</h1>

                                <Button
                                    type="button"
                                    onClick={handleConfirm}
                                    variant="outlined"
                                    className="normal-case font-semibold rounded-md text-base px-2 py-1 border border-[--site-onboarding-primary-color] text-center inline-flex items-center text-[--site-onboarding-primary-color]"
                                >
                                    <BiCheckCircle className="w-[30px] h-[30px] text-xl pointer-events-none p-1" />
                                    Confirm
                                </Button>
                            </div>
                            <div
                                name="text"
                                className="flex flex-col w-full gap-5 2xl:flex-row"
                            >
                                <div className="w-full 2xl:w-1/3">
                                    <BrandingTextItem
                                        title={"Title"}
                                        data={current_chat.chat_title}
                                    />
                                </div>
                                <div className="w-full 2xl:w-1/3">
                                    <BrandingTextItem
                                        title={"Description"}
                                        data={current_chat.chat_description}
                                    />
                                </div>
                                {user.role === 5 || user.role === 2 ? (
                                    <div className="w-full opacity-50 pointer-events-none 2xl:w-1/3">
                                        <BrandingTextItem
                                            title={"Copyright"}
                                            data={current_chat.chat_copyright}
                                        />
                                    </div>
                                ) : (
                                    <div className="w-full 2xl:w-1/3">
                                        <BrandingTextItem
                                            title={"Copyright"}
                                            data={current_chat.chat_copyright}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                        <div
                            name="bubble"
                            className="border-[--site-chat-header-border] border rounded-xl w-full p-5 gap-4 flex flex-col text-base text-black shadow-xl shadow-[--site-chat-header-border] bg-opacity-50"
                        >
                            <div>
                                <h1>Chat Bubble</h1>
                            </div>
                            <div
                                name="text"
                                className="flex flex-col w-full gap-5 2xl:flex-row"
                            >
                                <div className="w-full 2xl:w-1/2">
                                    <BubbleItem
                                        title={"Bubble"}
                                        data={current_chat.bubble}
                                    />
                                </div>
                                <div className="w-full 2xl:w-1/2">
                                    <NotificationBubble
                                        title={"Notification"}
                                        data={current_chat.bubble}
                                    />
                                </div>
                            </div>
                        </div>
                        <div
                            name="image"
                            className="border-[--site-chat-header-border] border rounded-xl w-full p-5 gap-4 flex flex-col text-base text-black shadow-xl shadow-[--site-chat-header-border] bg-opacity-50"
                        >
                            <div>
                                <h1>Images</h1>
                            </div>
                            <div
                                name="text"
                                className="flex flex-col w-full gap-5"
                            >
                                <div className="w-full">
                                    <LogoBranding
                                        title={"Logo"}
                                        data={current_chat.chat_logo}
                                    />
                                </div>
                                <div className="flex flex-col w-full gap-5 2xl:flex-row">
                                    <div className="w-full 2xl:w-1/2">
                                        <UserAvatarBranding
                                            title={"User avatar"}
                                            data={current_chat.chat_logo}
                                        />
                                    </div>
                                    <div className="w-full 2xl:w-1/2">
                                        <AIAvatarBranding
                                            title={"AI avatar"}
                                            data={current_chat.chat_logo}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div
                            name="message"
                            className="border-[--site-chat-header-border] border rounded-xl w-full p-5 gap-4 flex flex-col text-base text-black shadow-xl shadow-[--site-chat-header-border]"
                        >
                            <div>
                                <h1>Messages & Icons</h1>
                            </div>
                            <div
                                name="text"
                                className="flex flex-col w-full gap-5 2xl:flex-row"
                            >
                                <div className="w-full 2xl:w-1/3 h-full">
                                    <UserMessage
                                        title={"User"}
                                        data={current_chat.chat_logo}
                                    />
                                </div>
                                <div className="w-full 2xl:w-1/3 h-full">
                                    <AIMessage
                                        title={"AI"}
                                        data={current_chat.chat_logo}
                                    />
                                </div>
                                <div className="w-full 2xl:w-1/3 f-ull">
                                    <BackgroundColor
                                        title={"Background"}
                                        data={current_chat.chat_logo}
                                    />
                                </div>
                            </div>
                        </div>
                        <div
                            name="buttons"
                            className="border-[--site-chat-header-border] border rounded-xl w-full p-5 gap-4 flex flex-col text-base text-black shadow-xl shadow-[--site-chat-header-border]"
                        >
                            <div>
                                <h1>Buttons (Call-To-Action)</h1>
                            </div>
                            <div
                                name="text"
                                className="flex flex-col w-full gap-5 2xl:flex-row"
                            >
                                <div className="w-full 2xl:w-1/3 h-full">
                                    <ButtonBranding1
                                        title={"Button 1"}
                                        data={current_chat.chat_button}
                                    />
                                </div>
                                <div className="w-full 2xl:w-1/3 h-full">
                                    <ButtonBranding1
                                        title={"Button 2"}
                                        data={current_chat.chat_button}
                                    />
                                </div>
                                <div className="w-full 2xl:w-1/3 h-full">
                                    <ButtonBranding1
                                        title={"Button 3"}
                                        data={current_chat.chat_button}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Branding;
