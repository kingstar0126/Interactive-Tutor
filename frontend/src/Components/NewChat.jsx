import React, { useState, useRef, useEffect } from "react";
import { BsFillSendPlusFill, BsUpload, BsDownload } from "react-icons/bs";
import { BiImageAdd } from "react-icons/bi";
import { AiOutlineClose } from "react-icons/ai";
import { CiSquarePlus } from "react-icons/ci";
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
import { ThreeDots } from "react-loader-spinner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeMathjax from "rehype-mathjax";
import remarkMath from "remark-math";
import rehypeRaw from "rehype-raw";
import {
    Dialog,
    DialogBody,
    Menu,
    MenuHandler,
    MenuList,
    MenuItem,
    IconButton,
} from "@material-tailwind/react";

import PDF from "../assets/pdf.png";
import WORD from "../assets/word.jpg";
import XLSX from "../assets/xlsx.png";
import CSV from "../assets/csv.png";

const STEP = 30;

const NewChat = () => {
    const chatState = useSelector((state) => state.chat.chat);
    const chat = (chatState && JSON.parse(chatState)) || {};
    const chatbot = useSelector((state) => state.chat.chatbot);
    const chatId = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    let location = useLocation();
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
    const fileInput = useRef(null);

    const [message, setMessage] = useState("");
    const [streamData, setStreamData] = useState("");
    const [loading, setLoading] = useState(false);
    const [spinner, setSpinner] = useState(false);
    const [image, setImage] = useState([]);
    const [files, setFiles] = useState([]);
    const [chathistory, setChathistory] = useState([]);
    const [imagesrc, setImagesrc] = useState(null);
    const [state, setState] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [inputHeight, setInputHeight] = useState(2 * STEP);

    const query = new URLSearchParams(location.search);

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
        console.log(result);
        const fetchData = async () => {
            if (chat.access) {
                console.log(result, 'New chta', chatId);
                setLoading(true);
                let new_chat = chat;
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
            } else if (!chat.access || result) {
                setLoading(true);
                console.log(result, 'Here Embedded code', chatId);
                axios
                    .post(webAPI.getchat, chatId)
                    .then(async (res) => {
                        if (res.data.code === 200) {
                            getchat(dispatch, res.data.data);
                            setchatbot(dispatch, res.data.data);
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
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        setChathistory([]);
        setMessage("");
        setStreamData("");
        setSpinner(false);
        setImage([]);
        setFiles([]);
        setImagesrc(null);
        setState(false);
    }, [location.pathname]);

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
    }, [chat]);

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
            if (image.length) {
                const imagesrc = image.map((item) => URL.createObjectURL(item));
                const human = {
                    role: "human",
                    content: _message,
                    images: imagesrc,
                };
                setChathistory((prevHistory) => [...prevHistory, human]);
            } else {
                setChathistory((prevHistory) => [...prevHistory, human]);
            }

            await sendMessage(id, _message);

            event.preventDefault();
            setMessage("");
        }
    };

    const handleSubmitIcon = async (event) => {
        if (spinner === false) {
            let id = chatbot;
            let _message = message.trim();
            if (_message === "") {
                return;
            }
            let human = { role: "human", content: _message };
            if (image.length) {
                const imagesrc = image.map((item) => URL.createObjectURL(item));
                const human = {
                    role: "human",
                    content: _message,
                    images: imagesrc,
                };
                setChathistory((prevHistory) => [...prevHistory, human]);
            } else {
                setChathistory((prevHistory) => [...prevHistory, human]);
            }

            await sendMessage(id, _message);

            event.preventDefault();
            setMessage("");
        }
    };

    const sendMessage = async (id, _message) => {
        let { behaviormodel, train, model } = chat;
        if (!id || !_message) {
            return;
        }
        setSpinner(true);
        setState(true);
        // Create a new FormData to send the necessary data
        const formData = new FormData();
        formData.append("id", id);
        formData.append("_message", _message);
        formData.append("behaviormodel", behaviormodel);
        formData.append("train", train);
        formData.append("model", model);
        if (image.length) {
            image.map((item) => {
                formData.append("image", item);
            });
            setImage([]);
        }
        if (files.length) {
            files.map((item) => {
                formData.append("file", item);
            });
            setFiles([]);
        }

        // Send the formData to the streaming API
        fetch(webAPI.sendchat, {
            // mode: 'no-cors',
            method: "POST",
            body: formData,
        })
            .then(async (response) => {
                let res = "";
                if (!response.ok) {
                    if (response.status === 404) {
                        // Handle 404 error (Not found)
                        notification("error", "Not found tutor!");
                    } else if (response.status === 401) {
                        // Handle 401 error (Unauthorized)
                        notification(
                            "error",
                            "Insufficient queries remaining!"
                        );
                    } else if (response.status === 500) {
                        // Handle 500 error (Internal server error)
                        notification(
                            "error",
                            "The response is too long for this model. Please upgrade your model or enter a different prompt!"
                        );
                    } else {
                        // Handle other error cases
                        notification(
                            "error",
                            "The response is too long for this model. Please upgrade your model or enter a different prompt!"
                        );
                    }
                    throw new Error(
                        `Network response was not ok - ${response.status}`
                    );
                }
                // Read the response stream
                const reader = response.body.getReader();
                const decoder = new TextDecoder();

                await reader.read().then(function process({ done, value }) {
                    if (done) {
                        setStreamData("");
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
                getquery(dispatch, { id: chatbot });
            })
            .catch((error) => {
                console.error(
                    "There has been a problem with your fetch operation:",
                    error
                );
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
        e.preventDefault();
        imageInput.current?.click();
    };

    const handleUploadImage = (e) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setImage(files);
        }
        e.target.value = null;
    };

    const handleRemoveImage = (index) => {
        setImage((prevState) => {
            if (prevState.length === 1) {
                return [];
            } else {
                return prevState.filter((img, imgIndex) => imgIndex !== index);
            }
        });
    };

    const handleFileUploadClick = (e) => {
        e.preventDefault();
        fileInput.current?.click();
    };

    const handleUploadFile = (e) => {
        if (e.target.files) {
            const maxSize = 2 * 1024 * 1024;
            const files = Array.from(e.target.files);
            const areFilesValid = files.every((file) => {
                if (file.size > maxSize) {
                    notification(
                        "error",
                        "File is too large, please upload a file less than 2MB"
                    );
                    return false;
                } else {
                    return true;
                }
            });
            if (areFilesValid) {
                setFiles(files);
            }
        }
        e.target.value = null;
    };

    const handleRemoveFile = (index) => {
        setFiles((oldFiles) => oldFiles.filter((file, idx) => idx !== index));
    };

    const downloadImage = (src) => {
        const link = document.createElement("a");
        link.href = src;
        link.download = "image.jpg";
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleMessage = (e) => {
        const lines = Math.max(e.target.value.split("\n").length, 2);
        setInputHeight(Math.min(lines * STEP, 80));
        setMessage(e.target.value);
    };

    return (
        <div
            style={{
                background: chat?.chat_logo?.bg,
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
            <Toaster className="z-30"/>
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
                                                    className="flex flex-col w-full p-2 break-words whitespace-normal"
                                                >
                                                    {data.images &&
                                                    data.images.length ? (
                                                        <div className="flex flex-wrap">
                                                            {data.images.map(
                                                                (item) => {
                                                                    return (
                                                                        <>
                                                                            <img
                                                                                src={
                                                                                    item
                                                                                }
                                                                                alt="image"
                                                                                className="w-[100px] h-[100px]"
                                                                                onClick={() => {
                                                                                    setImagesrc(
                                                                                        item
                                                                                    );
                                                                                    handleImageClick();
                                                                                }}
                                                                            />
                                                                            <Dialog
                                                                                size="lg"
                                                                                open={
                                                                                    isModalOpen
                                                                                }
                                                                                handler={
                                                                                    handleImageClick
                                                                                }
                                                                            >
                                                                                <DialogBody className="h-[30rem] flex items-center justify-center">
                                                                                    <img
                                                                                        src={
                                                                                            imagesrc
                                                                                        }
                                                                                        alt="image"
                                                                                        className={`${
                                                                                            isModalOpen
                                                                                                ? "max-h-[28rem] max-w-[28rem]"
                                                                                                : ""
                                                                                        }`}
                                                                                    />
                                                                                </DialogBody>
                                                                            </Dialog>
                                                                        </>
                                                                    );
                                                                }
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <></>
                                                    )}
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
                                                    className="flex flex-col w-full p-2 break-words whitespace-normal"
                                                >
                                                    <ReactMarkdown
                                                        remarkPlugins={[
                                                            remarkGfm,
                                                            remarkMath,
                                                        ]}
                                                        rehypePlugins={[
                                                            rehypeMathjax,
                                                            rehypeRaw,
                                                        ]}
                                                        children={data.content}
                                                        className="break-words whitespace-normal"
                                                        components={{
                                                            code({
                                                                inline,
                                                                className,
                                                                children,
                                                                ...props
                                                            }) {
                                                                const match =
                                                                    /language-(\w+)/.exec(
                                                                        className ||
                                                                            ""
                                                                    );
                                                                if (
                                                                    !inline &&
                                                                    match
                                                                ) {
                                                                    // remove the newline character at the end of children, if it exists
                                                                    const codeString =
                                                                        String(
                                                                            children
                                                                        ).replace(
                                                                            /\n$/,
                                                                            ""
                                                                        );

                                                                    return (
                                                                        <CopyBlock
                                                                            text={
                                                                                codeString
                                                                            }
                                                                            language={
                                                                                match[1]
                                                                            }
                                                                            showLineNumbers={
                                                                                false
                                                                            }
                                                                            wrapLongLines
                                                                            theme={
                                                                                dracula
                                                                            }
                                                                            {...props}
                                                                        />
                                                                    );
                                                                }
                                                                return (
                                                                    <code
                                                                        className={
                                                                            className
                                                                        }
                                                                        {...props}
                                                                    >
                                                                        {
                                                                            children
                                                                        }
                                                                    </code>
                                                                );
                                                            },
                                                            table({
                                                                children,
                                                                ...props
                                                            }) {
                                                                return (
                                                                    <table
                                                                        style={{
                                                                            borderCollapse:
                                                                                "collapse",
                                                                            width: "100%",
                                                                            fontFamily:
                                                                                "Arial, sans-serif",
                                                                            fontSize:
                                                                                "14px",
                                                                        }}
                                                                        {...props}
                                                                    >
                                                                        {
                                                                            children
                                                                        }
                                                                    </table>
                                                                );
                                                            },
                                                            tr({
                                                                children,
                                                                ...props
                                                            }) {
                                                                return (
                                                                    <tr
                                                                        style={{
                                                                            backgroundColor:
                                                                                "#f8f8f8",
                                                                        }}
                                                                        {...props}
                                                                    >
                                                                        {
                                                                            children
                                                                        }
                                                                    </tr>
                                                                );
                                                            },
                                                            td({
                                                                children,
                                                                ...props
                                                            }) {
                                                                return (
                                                                    <td
                                                                        style={{
                                                                            padding:
                                                                                "8px",
                                                                            border: "1px solid #ddd",
                                                                        }}
                                                                        {...props}
                                                                    >
                                                                        {
                                                                            children
                                                                        }
                                                                    </td>
                                                                );
                                                            },
                                                            th({
                                                                children,
                                                                ...props
                                                            }) {
                                                                return (
                                                                    <th
                                                                        style={{
                                                                            padding:
                                                                                "8px",
                                                                            border: "1px solid #ddd",
                                                                            fontWeight:
                                                                                "bold",
                                                                            textAlign:
                                                                                "left",
                                                                        }}
                                                                        {...props}
                                                                    >
                                                                        {
                                                                            children
                                                                        }
                                                                    </th>
                                                                );
                                                            },
                                                            a({
                                                                href,
                                                                children,
                                                                ...props
                                                            }) {
                                                                return (
                                                                    <a
                                                                        style={{
                                                                            color: "#007bff",
                                                                            textDecoration:
                                                                                "none",
                                                                        }}
                                                                        href={
                                                                            href
                                                                        }
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        {...props}
                                                                    >
                                                                        {
                                                                            children
                                                                        }
                                                                    </a>
                                                                );
                                                            },
                                                            img({
                                                                node,
                                                                src,
                                                                alt,
                                                            }) {
                                                                return (
                                                                    <div className="relative">
                                                                        <img
                                                                            src={
                                                                                src
                                                                            }
                                                                            alt={
                                                                                alt
                                                                            }
                                                                        />
                                                                        <button
                                                                            onClick={() =>
                                                                                downloadImage(
                                                                                    src
                                                                                )
                                                                            }
                                                                            className="absolute top-2 right-2 text-black bg-transparent border-none"
                                                                        >
                                                                            <BsDownload />
                                                                        </button>
                                                                    </div>
                                                                );
                                                            },
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ) : null;
                                })}
                                {spinner === true && (
                                    <div
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
                                                className="flex flex-col w-full p-2 break-words whitespace-normal"
                                            >
                                                <ReactMarkdown
                                                    remarkPlugins={[
                                                        remarkGfm,
                                                        remarkMath,
                                                    ]}
                                                    rehypePlugins={[
                                                        rehypeMathjax,
                                                        rehypeRaw,
                                                    ]}
                                                    children={streamData}
                                                    className="break-words whitespace-normal"
                                                    components={{
                                                        code({
                                                            inline,
                                                            className,
                                                            children,
                                                            ...props
                                                        }) {
                                                            const match =
                                                                /language-(\w+)/.exec(
                                                                    className ||
                                                                        ""
                                                                );
                                                            if (
                                                                !inline &&
                                                                match
                                                            ) {
                                                                // remove the newline character at the end of children, if it exists
                                                                const codeString =
                                                                    String(
                                                                        children
                                                                    ).replace(
                                                                        /\n$/,
                                                                        ""
                                                                    );

                                                                return (
                                                                    <CopyBlock
                                                                        text={
                                                                            codeString
                                                                        }
                                                                        language={
                                                                            match[1]
                                                                        }
                                                                        showLineNumbers={
                                                                            false
                                                                        }
                                                                        wrapLongLines
                                                                        theme={
                                                                            dracula
                                                                        }
                                                                        {...props}
                                                                    />
                                                                );
                                                            }
                                                            return (
                                                                <code
                                                                    className={
                                                                        className
                                                                    }
                                                                    {...props}
                                                                >
                                                                    {children}
                                                                </code>
                                                            );
                                                        },
                                                        table({
                                                            children,
                                                            ...props
                                                        }) {
                                                            return (
                                                                <table
                                                                    style={{
                                                                        borderCollapse:
                                                                            "collapse",
                                                                        width: "100%",
                                                                        fontFamily:
                                                                            "Arial, sans-serif",
                                                                        fontSize:
                                                                            "14px",
                                                                    }}
                                                                    {...props}
                                                                >
                                                                    {children}
                                                                </table>
                                                            );
                                                        },
                                                        tr({
                                                            children,
                                                            ...props
                                                        }) {
                                                            return (
                                                                <tr
                                                                    style={{
                                                                        backgroundColor:
                                                                            "#f8f8f8",
                                                                    }}
                                                                    {...props}
                                                                >
                                                                    {children}
                                                                </tr>
                                                            );
                                                        },
                                                        td({
                                                            children,
                                                            ...props
                                                        }) {
                                                            return (
                                                                <td
                                                                    style={{
                                                                        padding:
                                                                            "8px",
                                                                        border: "1px solid #ddd",
                                                                    }}
                                                                    {...props}
                                                                >
                                                                    {children}
                                                                </td>
                                                            );
                                                        },
                                                        th({
                                                            children,
                                                            ...props
                                                        }) {
                                                            return (
                                                                <th
                                                                    style={{
                                                                        padding:
                                                                            "8px",
                                                                        border: "1px solid #ddd",
                                                                        fontWeight:
                                                                            "bold",
                                                                        textAlign:
                                                                            "left",
                                                                    }}
                                                                    {...props}
                                                                >
                                                                    {children}
                                                                </th>
                                                            );
                                                        },
                                                        a({
                                                            href,
                                                            children,
                                                            ...props
                                                        }) {
                                                            return (
                                                                <a
                                                                    style={{
                                                                        color: "#007bff",
                                                                        textDecoration:
                                                                            "none",
                                                                    }}
                                                                    href={href}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    {...props}
                                                                >
                                                                    {children}
                                                                </a>
                                                            );
                                                        },
                                                    }}
                                                />
                                                {state && (
                                                    <ThreeDots
                                                        height="50"
                                                        width="50"
                                                        color="#4fa94d"
                                                        ariaLabel="three-dots-loading"
                                                        radius="12.5"
                                                        wrapperStyle={{}}
                                                        wrapperClass=""
                                                        visible={true}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
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
                            <input
                                type="file"
                                className="hidden"
                                multiple
                                ref={imageInput}
                                onChange={handleUploadImage}
                                accept=".jpg,.jpeg,.png"
                            />
                            <input
                                type="file"
                                className="hidden"
                                ref={fileInput}
                                onChange={handleUploadFile}
                                accept=".pdf,.docx,.doc,.csv"
                            />
                            <div className="flex items-center w-full divide-x-2 sm:w-4/5 md:gap-2 gap-1">
                                <div className="flex w-full flex-col py-2.5 relative">
                                    <div className="flex p-3 absolute left-0 top-1/2 -translate-y-1/2">
                                        <Menu placement="top">
                                            <MenuHandler>
                                                <span>
                                                    <CiSquarePlus className="w-6 h-6 hover:scale-125 transition-transform duration-200" />
                                                </span>
                                            </MenuHandler>
                                            <MenuList>
                                                <MenuItem>
                                                    <div
                                                        className="flex h-full w-full items-center justify-start gap-2"
                                                        onClick={
                                                            handleImageUploadClick
                                                        }
                                                    >
                                                        <BiImageAdd className="w-6 h-6 hover:scale-125 transition-transform duration-200" />
                                                        <span>
                                                            Photo Library
                                                        </span>
                                                    </div>
                                                </MenuItem>

                                                <MenuItem>
                                                    <div
                                                        className="flex h-full w-full items-center justify-start gap-2"
                                                        onClick={
                                                            handleFileUploadClick
                                                        }
                                                    >
                                                        <BsUpload className="w-6 h-6 hover:scale-125 transition-transform duration-200" />
                                                        <span>Choose file</span>
                                                    </div>
                                                </MenuItem>
                                            </MenuList>
                                        </Menu>
                                    </div>
                                    <textarea
                                        type="text"
                                        rows="2"
                                        cols="50"
                                        value={message}
                                        onChange={handleMessage}
                                        onKeyDown={handleSubmit}
                                        style={{
                                            overflow: "hidden",
                                            height: `${inputHeight}px`,
                                        }}
                                        className="w-full text-[--site-card-icon-color] px-10 py-3 border border-gray-600 focus:outline-none rounded-md"
                                        placeholder="Type message"
                                    ></textarea>
                                    <div className="flex flex-wrap gap-2">
                                        {image &&
                                            image.length > 0 &&
                                            image.map((item, index) => {
                                                return (
                                                    <div
                                                        className="relative"
                                                        key={index}
                                                    >
                                                        <img
                                                            src={URL.createObjectURL(
                                                                item
                                                            )}
                                                            alt="file"
                                                            className="w-10 h-10"
                                                        />
                                                        <AiOutlineClose
                                                            onClick={() =>
                                                                handleRemoveImage(
                                                                    index
                                                                )
                                                            }
                                                            className="absolute w-4 h-4 top-0 right-0 text-white rounded-full bg-red-600"
                                                        />
                                                    </div>
                                                );
                                            })}
                                        {files &&
                                            files.length > 0 &&
                                            files.map((file, index) => {
                                                let FileIcon;
                                                switch (file.type) {
                                                    case "application/pdf":
                                                        FileIcon = (
                                                            <img
                                                                src={PDF}
                                                                alt="pdf-icon"
                                                                className="w-10 h-10"
                                                            />
                                                        );
                                                        break;
                                                    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                                                        FileIcon = (
                                                            <img
                                                                src={WORD}
                                                                alt="word-icon"
                                                                className="w-10 h-10"
                                                            />
                                                        );
                                                        break;
                                                    case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
                                                        FileIcon = (
                                                            <img
                                                                src={XLSX}
                                                                alt="xlsx-icon"
                                                                className="w-10 h-10"
                                                            />
                                                        );
                                                        break;
                                                    default:
                                                        FileIcon = (
                                                            <img
                                                                src={CSV}
                                                                alt="csv-icon"
                                                                className="w-10 h-10"
                                                            />
                                                        );
                                                        break;
                                                    // If the type is not one of the above, display a default icon or simply omit this case
                                                }
                                                return (
                                                    <div
                                                        className="relative"
                                                        key={index}
                                                    >
                                                        {FileIcon}
                                                        <p className="truncate w-16">
                                                            {file.name}
                                                        </p>
                                                        <AiOutlineClose
                                                            onClick={() =>
                                                                handleRemoveFile(
                                                                    index
                                                                )
                                                            }
                                                            className="absolute w-4 h-4 top-0 right-0 text-white rounded-full bg-red-600"
                                                        />
                                                    </div>
                                                );
                                            })}
                                    </div>
                                    <span
                                        onClick={handleSubmitIcon}
                                        className="flex p-3 absolute right-0 top-1/2 -translate-y-1/2"
                                    >
                                        <IconButton className=" bg-black w-8 h-8 rounded-md">
                                            <BsFillSendPlusFill className="w-5 h-5" />
                                        </IconButton>
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
