import { useState, useRef, useEffect } from "react";
import PinField from "react-pin-field";
import chatsend from "../assets/chatgpt-send.svg";
import axios from "axios";
import { webAPI } from "../utils/constants";
import { useSelector, useDispatch } from "react-redux";
import { Toaster } from "react-hot-toast";
import { setchatbot, getchatbot, getchat } from "../redux/actions/chatAction";
import { useNavigate } from "react-router-dom";
import { Scrollbar } from "react-scrollbars-custom";
import { CodeBlock, dracula } from "react-code-blocks";
import { useParams } from "react-router-dom";

const NewChat = () => {
    const navigate = useNavigate();
    const [chathistory, setChathistory] = useState([]);
    const previous_location = useSelector(
        (state) => state.location.previous_location
    );
    const current_location = useSelector(
        (state) => state.location.current_location
    );
    const dispatch = useDispatch();
    const pinFieldRef = useRef(null);
    const checkpinRef = useRef(null);
    const chatbot_logo = useRef(null);
    const chatbot_start = useRef(null);
    const chatbot_title = useRef(null);
    const window_chat = useRef(null);
    const chatbot_button1 = useRef(null);
    const chatbot_button2 = useRef(null);
    const chatbot_button3 = useRef(null);
    const chatbot_description = useRef(null);
    const human_background = useRef(null);
    const ai_background = useRef(null);
    const newchat = useRef(null);
    const messagesEndRef = useRef(null);
    const [validate, SetValidate] = useState(false);
    const [error, SetError] = useState(false);
    const [message, setMessage] = useState("");
    const chat = JSON.parse(useSelector((state) => state.chat.chat));
    const chatbot = useSelector((state) => state.chat.chatbot);
    const chatId = useParams();

    useEffect(() => {
        if (previous_location !== current_location && chat) {
            console.log("The new chatbot created!!!", chat);
            let new_chat = chat;
            setchatbot(dispatch, new_chat);
            if (chat.access === 0) {
                checkpinRef.current.classList.add("hidden");
                newchat.current.classList.remove("hidden");
            } else {
                checkpinRef.current.classList.remove("hidden");
                newchat.current.classList.add("hidden");
            }
            if (new_chat.conversation !== "") {
                setChathistory([
                    ...chathistory,
                    { role: "ai", content: new_chat.conversation },
                ]);
                chatbot_start.current.classList.add("hidden");
                window_chat.current.classList.remove("hidden");
            } else {
                chatbot_start.current.classList.remove("hidden");
                window_chat.current.classList.add("hidden");
            }
        } else if (chat) {
            console.log("The load chatbot!!!");
            let id = chatbot;
            axios
                .post(webAPI.getchat, { id: chat.id })
                .then((res) => {
                    console.log(res.data);
                    if (res.data.code === 200) {
                        getchat(dispatch, res.data.data);
                    }
                    // else navigate(-1);
                })
                .catch((err) => {
                    console.log(err);
                    // navigate(-1);
                });

            axios.post(webAPI.get_message, { id }).then((res) => {
                setChathistory(res.data.data.message);
            });
            if (chat.access === 0) {
                checkpinRef.current.classList.add("hidden");
                newchat.current.classList.remove("hidden");
            } else {
                checkpinRef.current.classList.remove("hidden");
                newchat.current.classList.add("hidden");
            }
            if (chathistory.length === 0) {
                console.log("hello, there");
                chatbot_start.current.classList.remove("hidden");
                window_chat.current.classList.add("hidden");
                console.log("hello, there", chat.chat_logo.width + "px");
            } else {
                chatbot_start.current.classList.add("hidden");
                window_chat.current.classList.remove("hidden");
                if (human_background.current) {
                    human_background.current.style["background-color"] =
                        chat.chat_logo.user_bg;
                    human_background.current.style.color =
                        chat.chat_logo.user_color;
                    human_background.current.style["font-size"] =
                        chat.chat_logo.user_size + "px";
                }
                if (ai_background.current) {
                    ai_background.current.style["background-color"] =
                        chat.chat_logo.ai_bg;
                    ai_background.current.style.color = chat.chat_logo.ai_color;
                    ai_background.current.style["font-size"] =
                        chat.chat_logo.ai_size + "px";
                }
            }
        } else if (!chat) {
            console.log(chatId);
            axios
                .post(webAPI.getchat, chatId)
                .then((res) => {
                    console.log(res.data);
                    if (res.data.code === 200) {
                        getchat(dispatch, res.data.data);
                        setchatbot(dispatch, res.data.data);
                    } else navigate(-1);
                })
                .catch((err) => {
                    console.log(err);
                    navigate(-1);
                });
        }
    }, []);

    useEffect(() => {
        if (chat) {
            if (chathistory.length > 0) {
                chatbot_start.current.classList.add("hidden");
                window_chat.current.classList.remove("hidden");
            } else {
                chatbot_start.current.classList.remove("hidden");
                window_chat.current.classList.add("hidden");
            }
            if (chat.chat_logo.status) {
                chatbot_logo.current.style.display = "none";
            } else {
                chatbot_logo.current.style.display = "block";
            }
            chatbot_logo.current.style.width = chat.chat_logo.width + "px";
            chatbot_logo.current.style.height = chat.chat_logo.height + "px";

            if (!chat.chat_title.status) {
                chatbot_title.current.style.display = "block";
            } else {
                chatbot_title.current.style.display = "none";
            }
            chatbot_title.current.style.color = chat.chat_title.color;
            chatbot_title.current.style["font-size"] =
                chat.chat_title.size + "px";

            if (!chat.chat_description.status) {
                chatbot_description.current.style.display = "block";
            } else {
                chatbot_description.current.style.display = "none";
            }
            chatbot_description.current.style.width = "66%";
            chatbot_description.current.style.color =
                chat.chat_description.color;
            chatbot_description.current.style["font-size"] =
                chat.chat_description.size;

            if (!chat.chat_button.button1_status) {
                chatbot_button1.current.style.display = "block";
            } else {
                chatbot_button1.current.style.display = "none";
            }

            chatbot_button1.current.style["background-color"] =
                chat.chat_button.button1_bg;
            chatbot_button1.current.style.color =
                chat.chat_button.button1_color;
            chatbot_button1.current.style["font-size"] =
                chat.chat_button.button1_size + "px";

            chatbot_button1.current.style.padding = "10px";
            chatbot_button1.current.style["border-radius"] = "0.75rem";

            if (!chat.chat_button.button2_status) {
                chatbot_button2.current.style.display = "block";
            } else {
                chatbot_button2.current.style.display = "none";
            }

            chatbot_button2.current.style["background-color"] =
                chat.chat_button.button2_bg;
            chatbot_button2.current.style.color =
                chat.chat_button.button2_color;
            chatbot_button2.current.style["font-size"] =
                chat.chat_button.button2_size + "px";

            chatbot_button2.current.style.padding = "10px";
            chatbot_button2.current.style["border-radius"] = "0.75rem";

            if (!chat.chat_button.button3_status) {
                chatbot_button3.current.style.display = "block";
            } else {
                chatbot_button3.current.style.display = "none";
            }

            chatbot_button3.current.style["background-color"] =
                chat.chat_button.button3_bg;
            chatbot_button3.current.style.color =
                chat.chat_button.button3_color;
            chatbot_button3.current.style["font-size"] =
                chat.chat_button.button3_size + "px";

            chatbot_button3.current.style.padding = "10px";
            chatbot_button3.current.style["border-radius"] = "0.75rem";
        }
    }, [chat]);

    useEffect(() => {
        if (chat) {
            messagesEndRef.current.scrollToBottom();
        }
        if (human_background.current) {
            human_background.current.style["background-color"] =
                chat.chat_logo.user_bg;
            human_background.current.style.color = chat.chat_logo.user_color;
            human_background.current.style["font-size"] =
                chat.chat_logo.user_size + "px";
        }
        if (ai_background.current) {
            ai_background.current.style["background-color"] =
                chat.chat_logo.ai_bg;
            ai_background.current.style.color = chat.chat_logo.ai_color;
            ai_background.current.style["font-size"] =
                chat.chat_logo.ai_size + "px";
        }
    }, [chathistory]);

    const handleComplete = (value) => {
        console.log(typeof value, typeof chat.access);

        if (chat.access != value) {
            SetError(true);
            pinFieldRef.current.forEach((input) => (input.value = ""));
            pinFieldRef.current[0].focus();
        } else {
            checkpinRef.current.classList.add("hidden");
            newchat.current.classList.remove("hidden");
        }
    };

    const handleSubmit = (event) => {
        if (event.keyCode === 13) {
            let id = chatbot;
            let _message = message;

            setChathistory([
                ...chathistory,
                { role: "human", content: _message },
            ]);
            sendMessage(id, _message);

            event.preventDefault();
            setMessage("");
        }
    };

    const sendMessage = (id, _message) => {
        let behaviormodel = chat.behaviormodel;
        axios
            .post(webAPI.sendchat, { id, _message, behaviormodel })
            .then((res) => {
                if (!res.data.success) console.log("error", res.data.message);
                else {
                    console.log(res.data.data);
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
        <div className="w-full h-screen">
            <Toaster />
            {chat && (
                <div className="w-full h-screen">
                    <div
                        className="flex flex-col py-5 w-full items-center justify-center"
                        ref={checkpinRef}
                    >
                        {
                            <div className="flex gap-2">
                                <PinField
                                    ref={pinFieldRef}
                                    name="chatdescription"
                                    length={4}
                                    type="password"
                                    inputMode="numeric"
                                    onRejectKey={() => {
                                        SetValidate(true);
                                    }}
                                    onResolveKey={() => {
                                        SetValidate(false);
                                    }}
                                    validate="0123456789"
                                    onComplete={handleComplete}
                                    className="mb-1 w-[40px] p-[15px] items-center justify-center h-[40px] focus:border-none focus:ring-opacity-40 text-[--site-card-icon-color] focus:outline-none focus:ring focus:border-[--site-main-color4] border rounded-lg hover:border-[--site-main-color5]"
                                />
                            </div>
                        }
                        {error && (
                            <span className="text-[--site-main-form-error] text-[12px]">
                                PIN is incorrect. Please try again!
                            </span>
                        )}
                        {validate && (
                            <span className="text-[--site-main-form-error] text-[12px]">
                                The PIN must be number
                            </span>
                        )}
                    </div>
                    <div
                        ref={newchat}
                        className="bg-[--site-card-icon-color] w-full px-10 h-full p-5 flex flex-col items-center justify-center"
                    >
                        <div
                            className="flex flex-col justify-center items-center gap-5 h-full"
                            ref={chatbot_start}
                        >
                            <img
                                src={chat.chat_logo.url}
                                ref={chatbot_logo}
                                alt="Logo"
                            />
                            <h1 ref={chatbot_title}>
                                {chat.chat_title.description}
                            </h1>
                            <span ref={chatbot_description}>
                                {chat.chat_description.description}
                            </span>

                            <div className="h-full w-3/5 flex items-end mb-5 p-2 gap-5 justify-center">
                                <a
                                    href={chat.chat_button.button1_url}
                                    ref={chatbot_button1}
                                    target="_blank"
                                >
                                    {chat.chat_button.button1_text}
                                </a>
                                <a
                                    ref={chatbot_button2}
                                    href={chat.chat_button.button2_url}
                                    target="_blank"
                                >
                                    {chat.chat_button.button2_text}
                                </a>
                                <a
                                    ref={chatbot_button3}
                                    href={chat.chat_button.button3_url}
                                    target="_blank"
                                >
                                    {chat.chat_button.button3_text}
                                </a>
                            </div>
                        </div>

                        <div
                            ref={window_chat}
                            className="w-full h-full"
                            name="main_scroll"
                        >
                            <Scrollbar
                                ref={messagesEndRef}
                                name="scroll content"
                            >
                                {chathistory.map((data, index) => {
                                    return data.role === "human" &&
                                        data.content ? (
                                        <div
                                            ref={human_background}
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
                                            ref={ai_background}
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
                                                                    <span
                                                                        key={
                                                                            index
                                                                        }
                                                                    >
                                                                        {item}
                                                                    </span>
                                                                );
                                                            } else {
                                                                return (
                                                                    <CodeBlock
                                                                        key={
                                                                            index
                                                                        }
                                                                        text={
                                                                            item
                                                                        }
                                                                        language={
                                                                            "javascript"
                                                                        }
                                                                        showLineNumbers={
                                                                            false
                                                                        }
                                                                        wrapLongLines={
                                                                            true
                                                                        }
                                                                        theme={
                                                                            dracula
                                                                        }
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
                            </Scrollbar>
                        </div>

                        <div className="flex w-2/3 divide-x-2">
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={handleSubmit}
                                className="rounded-none w-11/12 rounded-l-lg bg-[--site-main-color3] text-[--site-card-icon-color] block text-sm p-2.5 focus:border-[--site-logo-text-color] "
                                placeholder="Type message"
                            />
                            <span className="inline-flex w-1/12 items-center px-3 text-sm text-[--site-card-icon-color] bg-[--site-main-color3] border border-l-0 rounded-r-md">
                                <img
                                    src={chatsend}
                                    alt="send"
                                    className="w-auto h-auto"
                                />
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NewChat;
