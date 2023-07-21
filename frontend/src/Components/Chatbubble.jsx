import { useState, useRef, useEffect } from "react";
import { IoChatbubblesSharp } from "react-icons/io5";
import { Scrollbars } from "react-custom-scrollbars";
import { CodeBlock, dracula } from "react-code-blocks";
import axios from "axios";
import { webAPI } from "../utils/constants";
import chatsend from "../assets/chatgpt-send.svg";

const Chatbubble = () => {
    const bubbleWidget = useRef(null);
    const dialogWidget = useRef(null);
    const messagesEndRef = useRef(null);
    const [click, setClick] = useState(true);
    const [chathistory, setChathistory] = useState([]);
    const [message, setMessage] = useState("");
    const [chat, setChat] = useState({});

    const handleSubmit = (event) => {
        if (event.keyCode === 13) {
            let _message = message;

            setChathistory([
                ...chathistory,
                { role: "human", content: _message },
            ]);
            sendMessage(_message);

            event.preventDefault();
            setMessage("");
        }
    };

    useEffect(() => {
        let id = "83137bf2-a589-476b-b9ad-43f63f4a7574";
        axios
            .post(webAPI.getchat, { id: id })
            .then((res) => {
                setChat(res.data.data);
                setChathistory([
                    { role: "ai", content: "How can I help you?" },
                ]);
            })
            .catch((err) => console.error(err));
    }, []);

    useEffect(() => {
        if (click === true) {
            dialogWidget.current.classList.add("hidden");
        } else {
            dialogWidget.current.classList.remove("hidden");
        }
    }, [click]);

    const sendMessage = (_message) => {
        axios.post(webAPI.send_bubble_chat, { _message }).then((res) => {
            if (!res.data.success) {
                console.log("error");
            } else {
                receiveMessage(res.data.data);
            }
        });
    };

    const receiveMessage = (message) => {
        setChathistory((prevHistory) => [
            ...prevHistory,
            { role: "ai", content: message },
        ]);
    };

    return (
        <div>
            <div
                ref={dialogWidget}
                className="fixed right-[40px] bottom-[115px] rounded-xl bg-[--site-main-color10] border border-[--site-card-icon-color] flex flex-col items-center justify-center w-[400px] h-[600px] py-10 divide-y drop-shadow-xl"
            >
                <div className="w-full h-full bg-[--site-card-icon-color]">
                    <Scrollbars ref={messagesEndRef}>
                        {chathistory.map((data, index) => {
                            return data.role === "human" && data.content ? (
                                <div
                                    name="human_bg"
                                    className="flex items-center justify-center p-2"
                                    key={index}
                                >
                                    <div className="flex w-2/3">
                                        <img
                                            src={chat.chat_logo.user}
                                            alt="human"
                                            className="w-10 h-10"
                                        />
                                        <div
                                            name="human"
                                            className="text-[--site-logo-text-color] whitespace-break-spaces w-full flex p-2"
                                        >
                                            <span>{data.content}</span>
                                        </div>
                                    </div>
                                </div>
                            ) : data.role === "ai" && data.content ? (
                                <div
                                    name="ai_bg"
                                    className="flex items-center justify-center p-2"
                                    key={index}
                                >
                                    <div className="flex w-2/3">
                                        <img
                                            src={chat.chat_logo.ai}
                                            className="w-10 h-10"
                                            alt="AI"
                                        />
                                        <div
                                            name="ai"
                                            key={index}
                                            className="text-[--site-main-color3] whitespace-break-spaces w-full flex flex-col p-2"
                                        >
                                            {data.content
                                                .split("```")
                                                .map((item, index) => {
                                                    if (
                                                        index === 0 ||
                                                        index % 2 === 0
                                                    ) {
                                                        return (
                                                            <span key={index}>
                                                                {item}
                                                            </span>
                                                        );
                                                    } else {
                                                        return (
                                                            <CodeBlock
                                                                key={index}
                                                                text={item}
                                                                language={
                                                                    "javascript"
                                                                }
                                                                showLineNumbers={
                                                                    false
                                                                }
                                                                wrapLongLines={
                                                                    true
                                                                }
                                                                theme={dracula}
                                                                wrapLines
                                                            />
                                                        );
                                                    }
                                                })}
                                        </div>
                                    </div>
                                </div>
                            ) : null;
                        })}
                    </Scrollbars>
                </div>

                <div className="flex w-full p-2">
                    <input
                        type="text"
                        id="website-admin"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleSubmit}
                        className="rounded-none w-5/6 rounded-l-lg bg-[--site-main-color3] text-[--site-card-icon-color] text-sm p-2.5 focus:border-[--site-logo-text-color] "
                        placeholder="Type message"
                    />
                    <span className="inline-flex w-1/6 items-center justify-center px-3 text-sm text-[--site-card-icon-color] border border-l-0 rounded-r-md bg-[--site-main-color10]">
                        <img
                            src={chatsend}
                            alt="send"
                            className="w-[15px] h-[15px]"
                        />
                    </span>
                </div>
            </div>
            <div
                ref={bubbleWidget}
                onClick={() => setClick(!click)}
                className="fixed bottom-[40px] right-[40px]  w-16 h-16 rounded-full bg-[--site-logo-text-color] border-2 border-[--site-card-icon-color] items-center flex justify-center hover:bg-[--site-logo-text-color] hover:border-transparent hover:text-[--site-main-color3] transform hover:scale-110 transition-all duration-200 active:bg-[--site-card-icon-color]"
            >
                <IoChatbubblesSharp className="w-1/2 h-1/2 text-[--site-card-icon-color] pointer-events-none" />
            </div>
        </div>
    );
};

export default Chatbubble;
