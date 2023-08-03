import { useState, useRef, useEffect } from "react";
import { BsSendPlus } from "react-icons/bs";
import axios from "axios";
import { webAPI } from "../utils/constants";
import { useSelector, useDispatch } from "react-redux";
import { setchatbot, getchat } from "../redux/actions/chatAction";
import { useNavigate } from "react-router-dom";
import { Scrollbar } from "react-scrollbars-custom";
import { dracula, CopyBlock } from "react-code-blocks";
import toast, { Toaster } from "react-hot-toast";
import { useParams } from "react-router-dom";
import { getUserState } from "../redux/actions/userAction";
import { setquery } from "../redux/actions/queryAction";
import { useLocation } from "react-router-dom";
import ReactLoading from "react-loading";

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
    const backgroundRef = useRef(null);
    const chatbot_logo = useRef(null);
    const chatbot_start = useRef(null);
    const chatbot_copyright = useRef(null);
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
    let location = useLocation();
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const chat = JSON.parse(useSelector((state) => state.chat.chat));
    const chatbot = useSelector((state) => state.chat.chatbot);
    const chatId = useParams();
    const notification = (type, message) => {
        // To do in here
        if (type === "error") {
            toast.error(message);
        }
    };

    useEffect(() => {
        const pattern = /\/chat\/embedding\/(\w+)/;
        const result = pattern.exec(location.pathname);

        if (previous_location !== current_location && chat) {
            setLoading(true);
            let new_chat = chat;
            axios
                .get("https://geolocation-db.com/json/")
                .then((res) => {
                    let country = res.data.country_name;
                    getUserState(dispatch, { id: chat.user_id });
                    new_chat["country"] = country;
                    setchatbot(dispatch, new_chat);
                    setLoading(false);
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
                })
                .catch(() => {
                    setLoading(false);
                });
        } else if (previous_location === current_location && chat) {
            let id = chatbot;
            axios
                .post(webAPI.getchat, { id: id })
                .then((res) => {
                    if (res.data.code === 200) {
                        getchat(dispatch, res.data.data);
                    }
                })
                .catch((err) => {
                    console.log(err);
                });

            axios.post(webAPI.get_message, { id }).then((res) => {
                if (res.data.success === true) {
                    if (res.data.data.message) {
                        setChathistory(res.data.data.message);
                    }
                    if (res.data.data.message.length === 0) {
                        chatbot_start.current.classList.remove("hidden");
                        window_chat.current.classList.add("hidden");
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
                            ai_background.current.style.color =
                                chat.chat_logo.ai_color;
                            ai_background.current.style["font-size"] =
                                chat.chat_logo.ai_size + "px";
                        }
                    }
                }
            });
        } else if (!chat || result) {
            setLoading(true);
            axios
                .get("https://geolocation-db.com/json/")
                .then((res) => {
                    let country = res.data.country_name;
                    axios
                        .post(webAPI.getchat, chatId)
                        .then(async (res) => {
                            if (res.data.code === 200) {
                                getchat(dispatch, res.data.data);
                                res.data.data["country"] = country;
                                await axios
                                    .post(webAPI.start_message, res.data.data)
                                    .then((res) => {
                                        if (res.status === 200) {
                                            localStorage.setItem(
                                                "chatbot",
                                                res.data.data
                                            );
                                        }
                                    })
                                    .catch((err) => console.log(err));
                                setLoading(false);
                                window.location.reload();
                            } else {
                                navigate(-1);
                                setLoading(false);
                            }
                        })
                        .catch((err) => {
                            setLoading(false);
                            navigate(-1);
                        });
                })
                .catch((err) => {
                    setLoading(false);
                });
        }
    }, []);

    useEffect(() => {
        if (chat && loading === false) {
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

            if (!chat.chat_copyright.status) {
                chatbot_copyright.current.style.display = "block";
            } else {
                chatbot_copyright.current.style.display = "none";
            }
            chatbot_copyright.current.style.color = chat.chat_copyright.color;
            chatbot_copyright.current.style["font-size"] =
                chat.chat_copyright.size;

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

    const handleSubmit = (event) => {
        if (event.keyCode === 13) {
            let id = chatbot;
            let _message = message;
            if (_message === "") {
                return;
            }
            setChathistory([
                ...chathistory,
                { role: "human", content: _message },
            ]);
            sendMessage(id, _message);

            event.preventDefault();
            setMessage("");
        }
    };

    const handleSubmitmessage = () => {
        let id = chatbot;
        let _message = message;
        if (_message === "") {
            return;
        }
        setChathistory([...chathistory, { role: "human", content: _message }]);
        sendMessage(id, _message);

        setMessage("");
    };

    const sendMessage = (id, _message) => {
        let { behaviormodel, train, model } = chat;
        if (!id || !_message) {
            return;
        }
        axios
            .post(webAPI.sendchat, {
                id,
                _message,
                behaviormodel,
                train,
                model,
            })
            .then((res) => {
                if (!res.data.success) {
                    notification("error", res.data.message);
                } else {
                    setquery(dispatch, res.data.query);
                    receiveMessage(res.data.data);
                }
            })
            .catch((err) => console.error(err));
    };

    const receiveMessage = (message) => {
        setChathistory((prevHistory) => [
            ...prevHistory,
            { role: "ai", content: message },
        ]);
    };

    return (
        <div
            style={{
                background: `linear-gradient(to bottom right, ${chat.chat_logo.bg}, transparent)`,
            }}
            className="w-full h-full rounded-xl"
        >
            {loading && (
                <div className="flex flex-col items-center justify-center w-full min-h-[20rem]">
                    <ReactLoading
                        type="spin"
                        color="#FF2fff"
                        height={40}
                        width={40}
                        delay={15}
                    ></ReactLoading>
                    <span className="text-[--site-card-icon-color]">
                        Creating AI Tutor...
                    </span>
                </div>
            )}
            <Toaster />
            {chat && loading === false && (
                <div className="w-full h-screen lg:py-2">
                    <div
                        ref={newchat}
                        className="flex flex-col justify-center w-full h-full p-2 lg:items-center lg:px-10 lg:py-0 min-h-max"
                    >
                        <div
                            className="flex flex-col items-center justify-center h-full gap-5"
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
                        </div>

                        <div
                            ref={window_chat}
                            className="w-full pt-10 text-base font-medium h-4/5"
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
                                            className="flex items-center justify-start p-2 lg:justify-center"
                                            key={index}
                                        >
                                            <div className="flex justify-start lg:w-4/5">
                                                <img
                                                    src={chat.chat_logo.user}
                                                    alt="human"
                                                    className="w-10 h-10 rounded-full"
                                                />
                                                <div
                                                    name="human"
                                                    className="flex w-full p-2 whitespace-break-spaces"
                                                >
                                                    <span>{data.content}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ) : data.role === "ai" && data.content ? (
                                        <div
                                            ref={ai_background}
                                            name="ai_bg"
                                            className="flex items-center justify-start p-2 lg:justify-center"
                                            key={index}
                                        >
                                            <div className="flex justify-start lg:w-4/5">
                                                <img
                                                    src={chat.chat_logo.ai}
                                                    className="w-10 h-10 rounded-full"
                                                    alt="AI"
                                                />
                                                <div
                                                    name="ai"
                                                    className="flex flex-col w-full p-2 whitespace-break-spaces"
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
                                                                    <CopyBlock
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
                        <div className="flex flex-col items-center justify-center w-full">
                            <div className="flex items-end justify-center w-full gap-5 p-2 sm:w-3/5">
                                <a
                                    href={chat.chat_button.button1_url}
                                    ref={chatbot_button1}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    {chat.chat_button.button1_text}
                                </a>
                                <a
                                    ref={chatbot_button2}
                                    href={chat.chat_button.button2_url}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    {chat.chat_button.button2_text}
                                </a>
                                <a
                                    ref={chatbot_button3}
                                    href={chat.chat_button.button3_url}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    {chat.chat_button.button3_text}
                                </a>
                            </div>

                            <div className="flex items-center w-full divide-x-2 sm:w-4/5">
                                <div className="flex items-center justify-end w-full text-black">
                                    <input
                                        type="text"
                                        value={message}
                                        onChange={(e) =>
                                            setMessage(e.target.value)
                                        }
                                        onKeyDown={handleSubmit}
                                        className="w-full rounded-md border border-[--site-chat-header-border] bg-[--site-main-newchat-input-color] text-[--site-card-icon-color] block text-sm p-2.5 pr-9"
                                        placeholder="Type message"
                                    />

                                    <span
                                        onClick={() => {
                                            handleSubmitmessage();
                                        }}
                                        className="absolute pr-4"
                                    >
                                        <BsSendPlus />
                                    </span>
                                </div>
                            </div>

                            <div className="flex justify-center py-2">
                                <span
                                    ref={chatbot_copyright}
                                    className="text-[--site-file-upload]"
                                >
                                    {chat.chat_copyright.description}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NewChat;
