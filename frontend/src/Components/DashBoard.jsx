import React, { useState, useRef } from "react";
import toast, { Toaster } from "react-hot-toast";
import { BiImageAdd } from "react-icons/bi";
import { BsSendPlus, BsUpload, BsDownload } from "react-icons/bs";
import { useSelector, useDispatch } from "react-redux";
import { webAPI } from "../utils/constants";
import axios from "axios";

import PDF from "../assets/pdf.png";
import WORD from "../assets/word.jpg";
import XLSX from "../assets/xlsx.png";
import CSV from "../assets/csv.png";

const DashBoard = () => {
    const [image, setImage] = useState([]);
    const [files, setFiles] = useState([]);
    const [imagesrc, setImagesrc] = useState(null);
    const imageInput = useRef(null);
    const fileInput = useRef(null);
    const [message, setMessage] = useState("");
    const [chathistory, setChathistory] = useState([]);
    const [spinner, setSpinner] = useState(false);
    const chatbot = useSelector((state) => state.chat.chatbot);
    const chatState = useSelector((state) => state.chat.chat);
    const chat = (chatState && JSON.parse(chatState)) || {};
    const [state, setState] = useState(false);
    const [streamData, setStreamData] = useState("");

    const notification = (type, message) => {
        // To do in here
        if (type === "error") {
            toast.error(message);
        }
    };

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

    const downloadImage = (src) => {
        const link = document.createElement("a");
        link.href = src;
        link.download = "image.jpg";
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="w-full h-full flex flex-col px-36 py-28 gap-5 justify-start items-center">
            <div className="w-full flex items-center justify-center">
                New Chat
            </div>
            <div className="w-full grid grid-cols-2 items-center justify-center gap-4">
                <span className="border borde-black rounded-md">123</span>
                <span className="border borde-black rounded-md">123</span>
                <span className="border borde-black rounded-md">123</span>
                <span className="border borde-black rounded-md">123</span>
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

            <div className="flex items-center w-full divide-x-2 md:gap-2 gap-1 rounded-md">
                <div className="flex items-center justify-end w-full text-black relative rounded-md border border-[--site-chat-header-border] !bg-white">
                    <span
                        onClick={handleImageUploadClick}
                        className="absolute md:left-4 left-2 flex items-center"
                    >
                        <BiImageAdd className="w-6 h-6 hover:scale-125 transition-transform duration-200" />
                    </span>
                    <div className="flex flex-col w-full p-2.5 md:px-12 px-10">
                        <textarea
                            type="text"
                            rows="2"
                            cols="50"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={handleSubmit}
                            className="w-full text-[--site-card-icon-color] block text-sm focus:outline-none border-radius: 12px max-h-28"
                            placeholder="Type message"
                        />
                        <div className="flex flex-wrap gap-2">
                            {image &&
                                image.length > 0 &&
                                image.map((item, index) => {
                                    return (
                                        <div className="relative">
                                            <img
                                                src={URL.createObjectURL(item)}
                                                alt="file"
                                                className="w-10 h-10"
                                            />
                                            <button
                                                onClick={() =>
                                                    handleRemoveImage(index)
                                                }
                                                className="absolute w-3 h-3 top-0 right-0 bg-red-500 text-white rounded-full"
                                            ></button>
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
                                        <div className="relative" key={index}>
                                            {FileIcon}
                                            <p className="truncate w-16">
                                                {file.name}
                                            </p>
                                            <button
                                                onClick={() =>
                                                    handleRemoveFile(index)
                                                }
                                                className="absolute w-3 h-3 top-0 right-0 bg-red-500 text-white rounded-full"
                                            ></button>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>

                    <span
                        onClick={handleFileUploadClick}
                        className="absolute md:right-4 right-2 flex items-center"
                    >
                        <BsUpload className="w-5 h-5 hover:scale-125 transition-transform duration-200" />
                    </span>
                    <span
                        onClick={handleSubmitIcon}
                        className="flex items-center"
                    >
                        <BsSendPlus className="w-5 h-5 hover:scale-125 transition-transform duration-200" />
                    </span>
                </div>
            </div>
        </div>
    );
};

export default DashBoard;
