import { GrCheckmark } from "react-icons/gr";
import BrandingTextItem from "./BrandingTextItem";
import { useSelector, useDispatch } from "react-redux";
import { getchat } from "../redux/actions/chatAction";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { webAPI } from "../utils/constants";
import { useEffect } from "react";
import BubbleItem from "./Branding/Bubble/BubbleItem";
import NotificationBubble from "./Branding/Bubble/NotificationBubble";
import LogoBranding from "./Branding/Images/LogoBranding";
import UserAvatarBranding from "./Branding/Images/UserAvatarBranding";
import AIAvatarBranding from "./Branding/Images/AIAvatarBranding";
import AIMessage from "./Branding/Message/AIMessage";
import UserMessage from "./Branding/Message/UserMessage";
import ButtonBranding1 from "./Branding/Button/ButtonBranding1";
import ButtonBranding2 from "./Branding/Button/ButtonBranding2";
import ButtonBranding3 from "./Branding/Button/ButtonBranding3";

const Branding = () => {
    const dispatch = useDispatch();
    const chat = JSON.parse(useSelector((state) => state.chat.chat));
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
                notification("success", res.data.message);
            })
            .catch((err) => console.log(err));
    };

    return (
        <div className="container flex flex-col w-full h-full gap-5 p-5">
            <Toaster />
            <div className="flex justify-end">
                <button
                    type="button"
                    onClick={handleConfirm}
                    className="text-[--site-card-icon-color] bg-[--site-logo-text-color] hover:bg-[--site-card-icon-color]/90 focus:ring-4 focus:outline-none focus:ring-[--site-card-icon-color]/50 font-semibold rounded-xl text-sm px-2 py-1 text-center inline-flex items-center"
                >
                    <GrCheckmark className="w-[30px] h-[30px] text-xl pointer-events-none p-1" />
                    Confirm
                </button>
            </div>

            <div className="flex flex-col bg-[--site-main-color3] p-5 rounded-xl gap-2">
                <div name="Title">
                    <div>
                        <h1 className="border-b-[1px] border-[--site-card-icon-color] px-2 py-2 mb-2 font-bold">
                            Texts
                        </h1>
                    </div>
                    <div
                        name="text"
                        className="flex justify-center w-full gap-3 p-2"
                    >
                        <div className="w-1/3 border-[1px] border-[--site-card-icon-color] rounded-xl p-2">
                            <BrandingTextItem
                                title={"Title"}
                                data={current_chat.chat_title}
                            />
                        </div>
                        <div className="w-1/3 border-[1px] border-[--site-card-icon-color] rounded-xl p-2">
                            <BrandingTextItem
                                title={"Description"}
                                data={current_chat.chat_description}
                            />
                        </div>
                        {user.role === 5 || user.role === 2 ? (
                            <div className="pointer-events-none w-1/3 border-[1px] border-[--site-card-icon-color] opacity-50 rounded-xl p-2">
                                <BrandingTextItem
                                    title={"Copyright"}
                                    data={current_chat.chat_copyright}
                                />
                            </div>
                        ) : (
                            <div className="w-1/3 border-[1px] border-[--site-card-icon-color] rounded-xl p-2">
                                <BrandingTextItem
                                    title={"Copyright"}
                                    data={current_chat.chat_copyright}
                                />
                            </div>
                        )}
                    </div>
                </div>
                <div name="bubble">
                    <div>
                        <h1 className="border-b-[1px] border-[--site-card-icon-color] px-2 py-2 mb-2 font-bold">
                            Chat Bubble
                        </h1>
                    </div>
                    <div
                        name="text"
                        className="flex justify-start w-full gap-3 p-2"
                    >
                        <div className="w-1/2 border-[1px] border-[--site-card-icon-color] rounded-xl p-2">
                            <BubbleItem
                                title={"Bubble"}
                                data={current_chat.bubble}
                            />
                        </div>
                        <div className="w-1/2 border-[1px] border-[--site-card-icon-color] rounded-xl p-2">
                            <NotificationBubble
                                title={"Notification"}
                                data={current_chat.bubble}
                            />
                        </div>
                    </div>
                </div>
                <div name="image">
                    <div>
                        <h1 className="border-b-[1px] border-[--site-card-icon-color] px-2 py-2 mb-2 font-bold">
                            Images
                        </h1>
                    </div>
                    <div
                        name="text"
                        className="flex flex-col justify-start w-full gap-5 p-2"
                    >
                        <div className="border-[1px] border-[--site-card-icon-color] rounded-xl p-2">
                            <LogoBranding
                                title={"Logo"}
                                data={current_chat.chat_logo}
                            />
                        </div>
                        <div className="flex justify-start w-full gap-3">
                            <div className="w-1/2 border-[1px] border-[--site-card-icon-color] rounded-xl p-2">
                                <UserAvatarBranding
                                    title={"User avatar"}
                                    data={current_chat.chat_logo}
                                />
                            </div>
                            <div className="w-1/2 border-[1px] border-[--site-card-icon-color] rounded-xl p-2">
                                <AIAvatarBranding
                                    title={"AI avatar"}
                                    data={current_chat.chat_logo}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div name="message">
                    <div>
                        <h1 className="border-b-[1px] border-[--site-card-icon-color] px-2 py-2 mb-2 font-bold">
                            Messages & Icons
                        </h1>
                    </div>
                    <div
                        name="text"
                        className="flex justify-start w-full gap-5 p-2"
                    >
                        <div className="w-1/2 border-[1px] border-[--site-card-icon-color] rounded-xl p-2">
                            <UserMessage
                                title={"User"}
                                data={current_chat.chat_logo}
                            />
                        </div>
                        <div className="w-1/2 border-[1px] border-[--site-card-icon-color] rounded-xl p-2">
                            <AIMessage
                                title={"AI"}
                                data={current_chat.chat_logo}
                            />
                        </div>
                    </div>
                </div>
                <div name="buttons">
                    <div>
                        <h1 className="border-b-[1px] border-[--site-card-icon-color] px-2 py-2 mb-2 font-bold">
                            Buttons (Call-To-Action)
                        </h1>
                    </div>
                    <div
                        name="text"
                        className="flex justify-start w-full gap-5 p-2"
                    >
                        <div className="w-1/3 border-[1px] border-[--site-card-icon-color] rounded-xl p-2">
                            <ButtonBranding1
                                title={"Button 1"}
                                data={current_chat.chat_button}
                            />
                        </div>
                        <div className="w-1/3 border-[1px] border-[--site-card-icon-color] rounded-xl p-2">
                            <ButtonBranding2
                                title={"Button 2"}
                                data={current_chat.chat_button}
                            />
                        </div>
                        <div className="w-1/3 border-[1px] border-[--site-card-icon-color] rounded-xl p-2">
                            <ButtonBranding3
                                title={"Button 3"}
                                data={current_chat.chat_button}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Branding;
