import React, { useState, useRef, useEffect } from "react";
import { BsSendPlus, BsFillImageFill } from "react-icons/bs";
import axios from "axios";
import { webAPI } from "../utils/constants";
import { useSelector, useDispatch } from "react-redux";
import { setchatbot, getchat } from "../redux/actions/chatAction";
import { useNavigate } from "react-router-dom";
import { Scrollbar } from "react-scrollbars-custom";
import { dracula, CopyBlock } from "react-code-blocks";
import toast, { Toaster } from "react-hot-toast";
import { useParams } from "react-router-dom";
import { getquery } from "../redux/actions/queryAction";
import { useLocation } from "react-router-dom";
import ReactLoading from "react-loading";
import { Grid } from 'react-loader-spinner'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeMathjax from 'rehype-mathjax';
import remarkMath from 'remark-math';
import rehypeRaw from 'rehype-raw'
import { Dialog, DialogBody } from "@material-tailwind/react";

const NewChat = () => {
    const navigate = useNavigate();
    const [chathistory, setChathistory] = useState([]);
    const dispatch = useDispatch();
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
    const imageInput = useRef(null);
    let location = useLocation();
    const [message, setMessage] = useState("");
    const [streamData, setStreamData] = useState('');
    const [loading, setLoading] = useState(false);
    const [spinner, setSpinner] = useState(false);
    const [image, setImage] = useState(false);
    const [imagesrc, setImagesrc] = useState(false);
    const [state, setState] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const chatState = useSelector((state) => state.chat.chat);
    const chat = chatState && JSON.parse(chatState) || {};
    const chatbot = useSelector((state) => state.chat.chatbot);
    const chatId = useParams();
    const notification = (type, message) => {
        // To do in here
        if (type === "error") {
            toast.error(message);
        }
    };

    const handleImageClick = () => {
        setIsModalOpen(!isModalOpen);
    };

    useEffect(() => {
        const pattern = /\/chat\/embedding\/(\w+)/;
        const result = pattern.exec(location.pathname);
        const fetchData = async () => {
            if (chat.access) {
                setLoading(true);
                let new_chat = chat;
                await axios
                    .get("https://geolocation-db.com/json/")
                    .then((res) => {
                        let country = res.data.country_name;
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
            } else if (!chat.access || result) {
                setLoading(true);
                await axios
                    .get("https://geolocation-db.com/json/")
                    .then((res) => {
                        let country = res.data.country_name;
                        axios
                            .post(webAPI.getchat, chatId)
                            .then(async (res) => {
                                if (res.data.code === 200) {
                                    getchat(dispatch, res.data.data);
                                    res.data.data["country"] = country;
                                    setchatbot(dispatch, res.data.data)
                                    setLoading(false);
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
        }
        fetchData();
    }, []);

    useEffect(() => {
        if (chat.access && loading === false) {
            if (chat.conversation !== "" && chathistory.length == 0) {
                setChathistory([
                    ...chathistory,
                    { role: "ai", content: chat.conversation },
                ]);
                chatbot_start.current.classList.add("hidden");
                window_chat.current.classList.remove("hidden");
            }

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
    }, [chat])

    useEffect(() => {
        if (chat.access && messagesEndRef.current) {
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
    }, [chathistory, streamData]);

    const handleSubmit = async (event) => {
        if (!event.shiftKey && event.keyCode === 13 && spinner === false) {
            let id = chatbot;
            let _message = message.trim();
            if (_message === "") {
                return;
            }
            let human = { role: "human", content: _message };
            if (image) {

                human = { role: "human", content: _message, image: URL.createObjectURL(image) };
                setChathistory((prevHistory) => [...prevHistory, human]);

            } else {
                setChathistory((prevHistory) => [...prevHistory, human]);
            }

            await sendMessage(id, _message);

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

    const sendMessage = async (id, _message) => {
        let { behaviormodel, train, model } = chat;
        if (!id || !_message) {
            return;
        }
        setSpinner(true)
        setState(true)
        // Create a new FormData to send the necessary data
        const formData = new FormData();
        formData.append('id', id);
        formData.append('_message', _message);
        formData.append('behaviormodel', behaviormodel);
        formData.append('train', train);
        formData.append('model', model);
        if (image) {
            formData.append('image', image);
            console.log(image);
            setImage(null);
        }

        // Send the formData to the streaming API
        fetch(webAPI.sendchat, {
            // mode: 'no-cors',
            method: 'POST',
            body: formData
        })
            .then(async (response) => {
                let res = ''
                if (!response.ok) {
                    console.log(response)
                    if (response.status === 404) {
                        // Handle 404 error (Not found)
                        notification("error", "Not found tutor!")
                    } else if (response.status === 401) {
                        // Handle 401 error (Unauthorized)
                        notification("error", "Insufficient queries remaining!")
                    } else if (response.status === 500) {
                        // Handle 500 error (Internal server error)
                        notification("error", "The response is too long for this model. Please upgrade your model or enter a different prompt!")
                    } else {
                        // Handle other error cases
                        notification("error", "The response is too long for this model. Please upgrade your model or enter a different prompt!")
                    }
                    throw new Error(`Network response was not ok - ${response.status}`);
                }
                // Read the response stream
                const reader = response.body.getReader();
                const decoder = new TextDecoder();

                await reader.read().then(function process({ done, value }) {
                    if (done) {
                        setStreamData('')
                        receiveMessage(res);
                        setSpinner(false);
                        return;
                    }
                    setState(false);
                    let data = decoder.decode(value);
                    res += data;
                    setStreamData(res);

                    return reader.read().then(process);
                });
                getquery(dispatch, { id: chatbot })
            })
            .catch((error) => {
                console.error('There has been a problem with your fetch operation:', error);
                setSpinner(false);
            });
    };

    const receiveMessage = (message) => {
        setChathistory((prevHistory) => [
            ...prevHistory,
            { role: "ai", content: message },
        ]);
    };

    const handleImageUploadClick = (e) => {
        console.log("Uploading image...");
        e.preventDefault();
        imageInput.current?.click();
    };

    const handleUploadImage = (e) => {
        if (e.target.files) {
            const file = e.target.files[0];
            setImage(file)
        }
        e.target.value = null;
    };

    return (
        <div
            style={{
                background: `linear-gradient(to bottom right, ${chat?.chat_logo?.bg || '#ffffff00'}, transparent)`,
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
                        loading ...
                    </span>
                </div>
            )}
            <Toaster />
            {chat.access && loading === false && (
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
                                                    className="flex flex-col w-full p-2 whitespace-break-spaces"
                                                >

                                                    {data.image ? <>
                                                        <img
                                                            src={data.image}
                                                            alt="image"
                                                            className="w-[100px] h-[100px]"
                                                            onClick={() => { setImagesrc(data.image); handleImageClick(); }}
                                                        />
                                                        <Dialog size="lg" open={isModalOpen} handler={handleImageClick}>
                                                            <DialogBody className="h-[30rem] flex items-center justify-center">
                                                                <img
                                                                    src={imagesrc}
                                                                    alt="image"
                                                                    className={`${isModalOpen ? 'max-h-[28rem] max-w-[28rem]' : ''}`}
                                                                />
                                                            </DialogBody>
                                                        </Dialog>
                                                    </> : <></>}
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
                                                    <ReactMarkdown
                                                        remarkPlugins={[remarkGfm, remarkMath]}
                                                        rehypePlugins={[rehypeMathjax, rehypeRaw]}
                                                        children={data.content}
                                                        components={{
                                                            code({ inline, className, children, ...props }) {
                                                                const match = /language-(\w+)/.exec(className || '')
                                                                if (!inline && match) {
                                                                    // remove the newline character at the end of children, if it exists
                                                                    const codeString = String(children).replace(/\n$/, '');

                                                                    return (
                                                                        <CopyBlock
                                                                            text={codeString}
                                                                            language={match[1]}
                                                                            showLineNumbers={false}
                                                                            wrapLongLines
                                                                            theme={dracula}
                                                                            {...props}
                                                                        />
                                                                    );
                                                                }
                                                                return <code className={className} {...props}>{children}</code>;
                                                            },
                                                            table({ children, ...props }) {
                                                                return (
                                                                    <table style={{ borderCollapse: 'collapse', width: '100%', fontFamily: 'Arial, sans-serif', fontSize: '14px' }} {...props}>
                                                                        {children}
                                                                    </table>
                                                                );
                                                            },
                                                            // Add CSS styles to the table row
                                                            tr({ children, ...props }) {
                                                                return <tr style={{ backgroundColor: '#f8f8f8' }} {...props}>{children}</tr>;
                                                            },
                                                            // Add CSS styles to the table cell
                                                            td({ children, ...props }) {
                                                                return <td style={{ padding: '8px', border: '1px solid #ddd' }} {...props}>{children}</td>;
                                                            },
                                                            th({ children, ...props }) {
                                                                return <th style={{ padding: '8px', border: '1px solid #ddd', fontWeight: 'bold', textAlign: 'left' }} {...props}>{children}</th>;
                                                            },
                                                            a({ href, children, ...props }) {
                                                                return (
                                                                    <a style={{ color: '#007bff', textDecoration: 'none' }} href={href} target="_blank" rel="noopener noreferrer" {...props}>
                                                                        {children}
                                                                    </a>
                                                                );
                                                            },
                                                            li({ children, ...props }) {
                                                                // If children is a string, apply the transformation
                                                                if (typeof children === 'string') {
                                                                    children = children.replace(/(\d+\.)\s*\n\s*/g, "$1 ").trim();
                                                                }
                                                                return <li style={{ marginBottom: '0.25em' }} {...props}>{children}</li>;
                                                            },
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ) : null;
                                })}
                                {spinner === true && <div
                                    ref={ai_background}
                                    name="ai_bg"
                                    className="flex items-center justify-start p-2 lg:justify-center"
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
                                            <ReactMarkdown
                                                remarkPlugins={[remarkGfm, remarkMath]}
                                                rehypePlugins={[rehypeMathjax]}
                                                children={streamData}
                                                components={{
                                                    code({ inline, className, children, ...props }) {
                                                        const match = /language-(\w+)/.exec(className || '')
                                                        if (!inline && match) {
                                                            const codeString = String(children).replace(/\n$/, '');
                                                            return (
                                                                <CopyBlock
                                                                    text={codeString}
                                                                    language={match[1]}
                                                                    showLineNumbers={false}
                                                                    wrapLongLines
                                                                    theme={dracula}
                                                                    {...props}
                                                                />
                                                            );
                                                        }
                                                        return <code className={className} {...props}>{children}</code>;
                                                    },
                                                    table({ children, ...props }) {
                                                        return (
                                                            <table style={{ borderCollapse: 'collapse', width: '100%', fontFamily: 'Arial, sans-serif', fontSize: '14px' }} {...props}>
                                                                {children}
                                                            </table>
                                                        );
                                                    },
                                                    tr({ children, ...props }) {
                                                        return <tr style={{ backgroundColor: '#f8f8f8' }} {...props}>{children}</tr>;
                                                    },
                                                    td({ children, ...props }) {
                                                        return <td style={{ padding: '8px', border: '1px solid #ddd' }} {...props}>{children}</td>;
                                                    },
                                                    th({ children, ...props }) {
                                                        return <th style={{ padding: '8px', border: '1px solid #ddd', fontWeight: 'bold', textAlign: 'left' }} {...props}>{children}</th>;
                                                    },
                                                    a({ href, children, ...props }) {
                                                        return (
                                                            <a style={{ color: '#007bff', textDecoration: 'none' }} href={href} target="_blank" rel="noopener noreferrer" {...props}>
                                                                {children}
                                                            </a>
                                                        );
                                                    }
                                                }}
                                            />
                                            {state && <Grid
                                                height="50"
                                                width="50"
                                                color="#4fa94d"
                                                ariaLabel="grid-loading"
                                                radius="12.5"
                                                wrapperStyle={{}}
                                                wrapperClass=""
                                                visible={true}
                                            />}
                                        </div>
                                    </div>
                                </div>}
                            </Scrollbar>
                        </div>
                        <div className="flex flex-col items-center justify-center w-full">
                            <div className="flex items-end justify-center w-full gap-5 p-2 sm:w-3/5">
                                <a
                                    href={chat.chat_button.button1_url}
                                    ref={chatbot_button1}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="normal-case"
                                >
                                    {chat.chat_button.button1_text}
                                </a>
                                <a
                                    ref={chatbot_button2}
                                    href={chat.chat_button.button2_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="normal-case"
                                >
                                    {chat.chat_button.button2_text}
                                </a>
                                <a
                                    ref={chatbot_button3}
                                    href={chat.chat_button.button3_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="normal-case"
                                >
                                    {chat.chat_button.button3_text}
                                </a>
                            </div>

                            <div className="flex items-center w-full divide-x-2 sm:w-4/5">
                                <div className="flex justify-center items-center p-2 cursor-pointer hover:scale-105 transition-transform duration-200">
                                    <span onClick={handleImageUploadClick}>
                                        <BsFillImageFill className="hover:scale-125 transition-transform duration-200" />
                                    </span>
                                    <input type="file" className="hidden" ref={imageInput} onChange={handleUploadImage} accept=".jpg,.jpeg,.png" />
                                </div>
                                <div className="flex items-center justify-end w-full text-black">
                                    <textarea
                                        type="text"
                                        rows="2"
                                        cols="50"
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
                                            handleSubmitmessage()
                                        }}
                                        className="absolute pr-4"
                                    >
                                        <BsSendPlus className="hover:scale-125 transition-transform duration-200" />
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
