import React, { useState, useRef, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { BiImageAdd } from "react-icons/bi";
import { BsFillSendPlusFill, BsUpload, BsDownload } from "react-icons/bs";
import { CiSquarePlus } from "react-icons/ci";
import { AiOutlineClose } from "react-icons/ai";
import { useSelector, useDispatch } from "react-redux";
import { webAPI } from "../utils/constants";
import { ThreeDots } from "react-loader-spinner";
import { getchat, setchatbot } from "../redux/actions/chatAction";
import axios from "axios";
import { Scrollbar } from "react-scrollbars-custom";
import { dracula, CopyBlock } from "react-code-blocks";
import { getquery } from "../redux/actions/queryAction";
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
import { useNavigate } from "react-router-dom";

const PROMPTS = [
    "Help me create the ultimate lesson plan",
    "Give me ideas for classroom activities and games",
    "Change the reading age of this text",
    `I’d like feedback on what I have written`,
];

const chatbotID = "5cb0f7ca-825b-40eb-b403-e6bf1555b609";
const STEP = 30;
const DashBoard = () => {
    const [image, setImage] = useState([]);
    const [files, setFiles] = useState([]);
    const [imagesrc, setImagesrc] = useState(null);
    const [message, setMessage] = useState("");
    const [chathistory, setChathistory] = useState([]);
    const [spinner, setSpinner] = useState(false);
    const [state, setState] = useState(false);
    const [streamData, setStreamData] = useState("");
    const chatState = useSelector((state) => state.chat.chat);
    const chat = (chatState && JSON.parse(chatState)) || {};
    const chatbot = useSelector((state) => state.chat.chatbot);
    const user = JSON.parse(useSelector((state) => state.user.user));
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [inputHeight, setInputHeight] = useState(2 * STEP);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const chatbot_start = useRef(null);
    const window_chat = useRef(null);
    const messagesEndRef = useRef(null);
    const imageInput = useRef(null);
    const fileInput = useRef(null);

    const notification = (type, message) => {
        // To do in here
        if (type === "error") {
            toast.error(message);
        }
    };

    useEffect(() => {
        if (!user) {
            navigate("/login");
        } else {
            if (user.role === 5 || user.role === 0) {
                navigate("/chatbot/chat/onboarding");
            } else {
                axios
                    .post(webAPI.getchat, {
                        id: chatbotID,
                    })
                    .then((res) => {
                        getchat(dispatch, res.data.data);
                        setchatbot(dispatch, res.data.data);
                    });
            }
        }
    }, []);

    useEffect(() => {
        if (chat.access) {
            if (chathistory.length > 0) {
                chatbot_start.current.classList.add("hidden");
                window_chat.current.classList.remove("hidden");
            } else {
                chatbot_start.current.classList.remove("hidden");
                window_chat.current.classList.add("hidden");
            }
        }
    }, [chat]);

    useEffect(() => {
        if (chat.access && messagesEndRef.current) {
            messagesEndRef.current.scrollToBottom();
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

    const handleClickSubmitIcon = async (event) => {
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

    const handlePromptClick = async (item) => {
        let id = chatbot;
        let _message = item.trim();
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
        setMessage("");
    };

    const receiveMessage = (message) => {
        setChathistory((prevHistory) => [
            ...prevHistory,
            { role: "ai", content: message },
        ]);
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
        formData.append("user_id", user.id);
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
                        console.log(res);
                        setSpinner(false);
                        return;
                    }
                    setState(false);
                    let data = decoder.decode(value);
                    res += data;
                    setStreamData(res);

                    return reader.read().then(process);
                });
                getquery(dispatch, { id: chatbot, user_id: user.id });
            })
            .catch((error) => {
                console.error(
                    "There has been a problem with your fetch operation:",
                    error
                );
                setSpinner(false);
            });
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

    const handleImageClick = () => {
        setIsModalOpen(!isModalOpen);
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
        <>
            <div className="flex flex-col justify-center w-full h-screen p-2 lg:items-center lg:px-10 lg:py-0 min-h-max">
                <div
                    className="flex flex-col items-center justify-center gap-10 h-4/5"
                    ref={chatbot_start}
                >
                    <div className="h-2/3 flex flex-col items-center justify-center gap-10">
                        <img
                            src="https://app.interactive-tutor.com/api/imageupload/default_ai.png"
                            alt="Logo"
                            className="w-20 h-20"
                        />
                        <span className="text-center md:text-4xl text-2xl">
                            How can I help you today?
                        </span>
                    </div>
                    <div className="h-1/3 w-full flex flex-wrap-reverse justify-between overflow-hidden lg:px-8 mb-10">
                        {PROMPTS.map((item, index) => (
                            <div
                                key={index}
                                className="cursor-pointer md:w-1/2 md:h-1/2 w-full p-2 h-1/2"
                            >
                                <span
                                    className="border-gray-400 border rounded-md text-lg px-5 overflow-hidden w-full h-full items-center justify-start flex"
                                    onClick={() => handlePromptClick(item)}
                                >
                                    {item}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div
                    ref={window_chat}
                    className="w-full pt-10 text-base font-medium h-4/5"
                    name="main_scroll"
                >
                    <Scrollbar ref={messagesEndRef} name="scroll content">
                        {chathistory.map((data, index) => {
                            return data.role === "human" && data.content ? (
                                <div
                                    name="human_bg"
                                    className="flex items-center justify-start p-2 lg:justify-center"
                                    key={index}
                                >
                                    <div className="flex justify-start w-full px-10">
                                        <img
                                            src="https://app.interactive-tutor.com/api/imageupload/default_user.png"
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
                                                    {data.images.map((item) => {
                                                        return (
                                                            <>
                                                                <img
                                                                    src={item}
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
                                                    })}
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
                                    name="ai_bg"
                                    className="flex items-center justify-start p-2 lg:justify-center"
                                    key={index}
                                >
                                    <div className="flex justify-start px-10 w-full">
                                        <img
                                            src="https://app.interactive-tutor.com/api/imageupload/default_ai.png"
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
                                                                className || ""
                                                            );
                                                        if (!inline && match) {
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
                                                    tr({ children, ...props }) {
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
                                                    td({ children, ...props }) {
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
                                                    th({ children, ...props }) {
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
                                                    img({ node, src, alt }) {
                                                        return (
                                                            <div className="relative">
                                                                <img
                                                                    src={src}
                                                                    alt={alt}
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
                                name="ai_bg"
                                className="flex items-center justify-start p-2 lg:justify-center"
                            >
                                <div className="flex justify-start px-10 w-full">
                                    <img
                                        src="https://app.interactive-tutor.com/api/imageupload/default_ai.png"
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
                                                            className || ""
                                                        );
                                                    if (!inline && match) {
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
                                                                theme={dracula}
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
                                                table({ children, ...props }) {
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
                                                tr({ children, ...props }) {
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
                                                td({ children, ...props }) {
                                                    return (
                                                        <td
                                                            style={{
                                                                padding: "8px",
                                                                border: "1px solid #ddd",
                                                            }}
                                                            {...props}
                                                        >
                                                            {children}
                                                        </td>
                                                    );
                                                },
                                                th({ children, ...props }) {
                                                    return (
                                                        <th
                                                            style={{
                                                                padding: "8px",
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
                                                visible={true}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </Scrollbar>
                </div>
                <div className="flex flex-col items-center justify-start w-full h-1/5 lg:px-10 px-2">
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
                    <div className="flex items-center w-full divide-x-2md:gap-2 gap-1">
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
                                                onClick={handleImageUploadClick}
                                            >
                                                <BiImageAdd className="w-6 h-6 hover:scale-125 transition-transform duration-200" />
                                                <span>Photo Library</span>
                                            </div>
                                        </MenuItem>

                                        <MenuItem>
                                            <div
                                                className="flex h-full w-full items-center justify-start gap-2"
                                                onClick={handleFileUploadClick}
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
                                rows="3"
                                cols="50"
                                value={message}
                                onChange={handleMessage}
                                onKeyDown={handleSubmit}
                                style={{
                                    overflow: "hidden",
                                    height: `${inputHeight}px`,
                                }}
                                className="w-full text-[--site-card-icon-color] px-10 py-3 border border-gray-600 focus:outline-none rounded-md resize"
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
                                                        handleRemoveImage(index)
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
                                                        handleRemoveFile(index)
                                                    }
                                                    className="absolute w-4 h-4 top-0 right-0 text-white rounded-full bg-red-600"
                                                />
                                            </div>
                                        );
                                    })}
                            </div>
                            <span
                                onClick={handleClickSubmitIcon}
                                className="flex p-3 absolute right-0 top-1/2 -translate-y-1/2"
                            >
                                <IconButton className=" bg-[--site-onboarding-primary-color] w-8 h-8 rounded-md">
                                    <BsFillSendPlusFill className="w-5 h-5" />
                                </IconButton>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default DashBoard;
