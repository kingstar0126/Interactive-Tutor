import { useEffect, useRef, useState } from "react";
import {
    DialogHeader,
    Dialog,
    DialogBody,
    DialogFooter,
} from "@material-tailwind/react";
import { useSelector } from "react-redux";
import { Scrollbar } from "react-scrollbars-custom";

const EMBED_SERVER_URL = process.env.REACT_APP_EMBED_SERVER_URL;
const Embedded = (props) => {
    const [chatwindow, setChatwindow] = useState("");
    const [chatURL, setChatURL] = useState("");
    const [bubble, setBubble] = useState("");
    const chatbot_window = useRef(null);
    const chatbot_bubble = useRef(null);
    const chatbot_URL = useRef(null);
    const chatbot_organization = useRef(null);
    const chatbot_access = useRef(null);
    const chatState = useSelector((state) => state.chat.chat);
    const chat = chatState && JSON.parse(chatState) || {};

    useEffect(() => {
        setChatURL(`${EMBED_SERVER_URL}/chatbot/share/url`);
        setChatwindow(
            `<iframe style="border: 0" frameborder="0" scrolling="no" height="600px" width="100%" src="${EMBED_SERVER_URL}/chat/embedding/${props.data.uuid}"></iframe>`
        );
        setBubble(
            `<script type="text/javascript">window.$icg=[];window.ICG_WIDGET_ID="${props.data.uuid}";(function(){d=document;s=d.createElement("script");s.src="${EMBED_SERVER_URL}/widget/bubble.js";s.async=1;d.getElementsByTagName("head")[0].appendChild(s);})();</script>`
        );
    }, []);

    return (
        <Dialog
            open={props.open}
            size={"lg"}
            handler={props.handleCancel}
            className="border-[--site-chat-header-border] border rounded-md shadow-lg shadow-[--site-onboarding-primary-color]"
        >
            <DialogHeader className="px-8 pt-8 pb-6">
                <span className="text-[32px] leading-12 font-semibold text-[--site-onboarding-primary-color]">
                    Embed or Share
                </span>
            </DialogHeader>
            <DialogBody className="border-t border-[--site-chat-header-border] text-black text-base font-medium pl-8 py-5 h-[30rem]">
                <Scrollbar>
                    <div className="mr-4">
                        <div className="flex flex-col items-center justify-center w-full my-5">
                            <div
                                name="Window embedding"
                                className="border items-start gap-5 justify-center border-[--site-chat-header-border] rounded-xl w-full py-5 flex flex-col"
                            >
                                <h3 className="border-b-[1px] border-[--site-chat-header-border] p-5 w-full">
                                    Your Information
                                </h3>
                                <div className="flex flex-col w-full gap-2 px-5">
                                    <span>Your Organisation ID:</span>
                                    <input
                                        ref={chatbot_organization}
                                        defaultValue={chat.organization}
                                        readOnly
                                        className="w-full rounded-xl text-[--site-onboarding-primary-color] p-5 bg-transparent border-[--site-chat-header-border] border"
                                    />
                                </div>
                                <button
                                    className="bg-[--site-onboarding-primary-color] text-white py-2 px-4 gap-2 rounded-md mx-5"
                                    onClick={() => {
                                        chatbot_organization.current.select();
                                        document.execCommand("copy");
                                    }}
                                >
                                    Copy to clipboard
                                </button>

                                <div className="flex flex-col w-full gap-2 px-5">
                                    <span>Your PIN Code:</span>
                                    <input
                                        ref={chatbot_access}
                                        defaultValue={chat.access}
                                        readOnly
                                        className="w-full rounded-xl text-[--site-onboarding-primary-color] p-5 bg-transparent border-[--site-chat-header-border] border"
                                    />
                                </div>
                                <button
                                    className="bg-[--site-onboarding-primary-color] text-white py-2 px-4 gap-2 rounded-md mx-5"
                                    onClick={() => {
                                        chatbot_access.current.select();
                                        document.execCommand("copy");
                                    }}
                                >
                                    Copy to clipboard
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col items-center justify-center w-full my-5">
                            <div
                                name="Window embedding"
                                className="border items-start gap-5 justify-center border-[--site-chat-header-border] rounded-xl w-full py-5 flex flex-col"
                            >
                                <h3 className="border-b-[1px] border-[--site-chat-header-border] p-5 w-full">
                                    Share AI Bots with URL.
                                </h3>
                                <div className="flex flex-col w-full gap-2 px-5">
                                    <span>
                                        You can access in this AI Bots with URL
                                    </span>
                                    <textarea
                                        ref={chatbot_URL}
                                        rows={1}
                                        cols={40}
                                        defaultValue={chatURL}
                                        readOnly
                                        className="w-full rounded-xl text-[--site-onboarding-primary-color] p-5 bg-transparent border-[--site-chat-header-border] border"
                                    />
                                </div>
                                <button
                                    className="bg-[--site-onboarding-primary-color] text-white py-2 px-4 gap-2 rounded-md mx-5"
                                    onClick={() => {
                                        chatbot_URL.current.select();
                                        document.execCommand("copy");
                                    }}
                                >
                                    Copy to clipboard
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col items-center justify-center w-full my-5">
                            <div
                                name="Window embedding"
                                className="border items-start gap-5 justify-center border-[--site-chat-header-border] rounded-xl w-full py-5 flex flex-col"
                            >
                                <h3 className="border-b-[1px] border-[--site-chat-header-border] p-5 w-full">
                                    Embed as an iframe
                                </h3>
                                <div className="flex flex-col w-full gap-2 px-5">
                                    <span>Embed everywhere you want</span>
                                    <textarea
                                        ref={chatbot_window}
                                        rows={4}
                                        cols={40}
                                        readOnly
                                        defaultValue={chatwindow}
                                        className="w-full rounded-xl text-[--site-onboarding-primary-color] p-5 bg-transparent border-[--site-chat-header-border] border"
                                    />
                                </div>
                                <button
                                    className="bg-[--site-onboarding-primary-color] text-white py-2 px-4 gap-2 rounded-md mx-5"
                                    onClick={() => {
                                        chatbot_window.current.select();
                                        document.execCommand("copy");
                                    }}
                                >
                                    Copy to clipboard
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col items-center justify-center w-full my-5">
                            <div
                                name="Window embedding"
                                className="border items-start gap-5 justify-center border-[--site-chat-header-border] rounded-xl w-full py-5 flex flex-col"
                            >
                                <h3 className="border-b-[1px] border-[--site-chat-header-border] p-5 w-full">
                                    Embed as a chat bubble
                                </h3>
                                <div className="flex flex-col w-full gap-2 px-5">
                                    <span>Add it in the HTML head section</span>
                                    <textarea
                                        ref={chatbot_bubble}
                                        rows={5}
                                        cols={40}
                                        defaultValue={bubble}
                                        readOnly
                                        className="w-full rounded-xl text-[--site-onboarding-primary-color] p-5 bg-transparent border-[--site-chat-header-border] border"
                                    />
                                </div>
                                <button
                                    className="bg-[--site-onboarding-primary-color] text-white py-2 px-4 gap-2 rounded-md mx-5"
                                    onClick={() => {
                                        chatbot_bubble.current.select();
                                        document.execCommand("copy");
                                    }}
                                >
                                    Copy to clipboard
                                </button>
                            </div>
                        </div>
                    </div>
                </Scrollbar>
            </DialogBody>
            <DialogFooter className="flex items-center justify-end gap-4 px-10 pb-8">
                <button
                    onClick={props.handleCancel}
                    className="bg-transparent border-[--site-onboarding-primary-color] text-[--site-onboarding-primary-color] text-base font-semibold border rounded-md px-4 py-2"
                >
                    cancel
                </button>

                <button
                    onClick={props.handleOk}
                    className="px-4 py-2 text-base font-semibold text-white bg-[--site-onboarding-primary-color] rounded-md"
                >
                    confirm
                </button>
            </DialogFooter>
        </Dialog>
    );
};

export default Embedded;
