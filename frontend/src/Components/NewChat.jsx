import React, { useState, useRef, useEffect, useMemo } from "react";
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
import AWS from "aws-sdk";
import ChatBox from "../common/components/Chats/ChatBox";
const STEP = 30;

AWS.config.update({
  accessKeyId: process.env.REACT_APP_ACCESS_KEY_ID,
  secretAccessKey: process.env.REACT_APP_ACCESS_SECRET_KEY,
});
const S3_BUCKET = process.env.REACT_APP_S3_PRIVATE;
const s3 = new AWS.S3({
  params: { Bucket: S3_BUCKET },
  region: process.env.REACT_APP_REGION,
});

const NewChat = () => {
  const chatState = useSelector((state) => state.chat.chat);
  const chat = (chatState && JSON.parse(chatState)) || {};
  const chatbot = useSelector((state) => state.chat.chatbot);
  const chatId = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  let location = useLocation();
  const chatbot_logo = useRef(null);
  const chatbot_copyright = useRef(null);
  const chatbot_title = useRef(null);
  const chatbot_button1 = useRef(null);
  const chatbot_button2 = useRef(null);
  const chatbot_button3 = useRef(null);
  const chatbot_description = useRef(null);
  const human_background = useRef(null);
  const ai_background = useRef(null);
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
    const fetchData = async () => {
      if (chat.access) {
        setLoading(true);
        let new_chat = chat;
        setchatbot(dispatch, new_chat);
        setLoading(false);
      } else if (!chat.access || result) {
        setLoading(true);
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

  const chatbot_start = useMemo(() => {
    if (
      chat.conversation &&
      chat.conversation !== "" &&
      chathistory.length == 0
    ) {
      setChathistory([
        ...chathistory,
        { role: "ai", content: chat.conversation },
      ]);
      return true;
    }
    if (chathistory.length > 0) {
      return false;
    }
    return true;
  }, [chat, chathistory]);

  useEffect(() => {
    if (chat.access && loading === false) {
      if (chatbot_start) {
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
        chatbot_title.current.style["font-size"] = chat.chat_title.size + "px";

        if (!chat.chat_description.status) {
          chatbot_description.current.style.display = "block";
        } else {
          chatbot_description.current.style.display = "none";
        }
        chatbot_description.current.style.width = "66%";
        chatbot_description.current.style.color = chat.chat_description.color;
        chatbot_description.current.style["font-size"] =
          chat.chat_description.size;
      }

      if (!chat.chat_copyright.status) {
        chatbot_copyright.current.style.display = "block";
      } else {
        chatbot_copyright.current.style.display = "none";
      }
      chatbot_copyright.current.style.color = chat.chat_copyright.color;
      chatbot_copyright.current.style["font-size"] = chat.chat_copyright.size;

      if (!chat.chat_button.button1_status) {
        chatbot_button1.current.style.display = "block";
      } else {
        chatbot_button1.current.style.display = "none";
      }

      chatbot_button1.current.style["background-color"] =
        chat.chat_button.button1_bg;
      chatbot_button1.current.style.color = chat.chat_button.button1_color;
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
      chatbot_button2.current.style.color = chat.chat_button.button2_color;
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
      chatbot_button3.current.style.color = chat.chat_button.button3_color;
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
      ai_background.current.style["background-color"] = chat.chat_logo.ai_bg;
      ai_background.current.style.color = chat.chat_logo.ai_color;
      ai_background.current.style["font-size"] = chat.chat_logo.ai_size + "px";
    }
  }, [chathistory]);

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
      setMessage("");
      await sendMessage(id, _message);

      event.preventDefault();
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
      setMessage("");
      await sendMessage(id, _message);

      event.preventDefault();
    }
  };

  const sendMessage = async (id, _message) => {
    let { behaviormodel, train, model } = chat;
    if (!id || !_message) {
      notification("error", "SomeThing is missing!");
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
    const imageUploadPromises = image.map(async (item) => {
      const filename = chat.uuid + item.name.replaceAll(" ", "");
      const params = {
        Bucket: S3_BUCKET,
        Key: filename,
        Body: item,
      };
      return s3
        .putObject(params)
        .promise()
        .then(() => {
          formData.append("image", filename);
        })
        .catch((err) => {
          notification("error", err.message);
        });
    });

    // Use Promise.all to wait for all file uploads to finish
    const fileUploadPromises = files.map(async (item) => {
      const filename = chat.uuid + item.name.replaceAll(" ", "");
      const params = {
        Bucket: S3_BUCKET,
        Key: filename,
        Body: item,
      };
      return s3
        .putObject(params)
        .promise()
        .then(() => {
          console.log("FILE");
          formData.append("file", filename);
        })
        .catch((err) => {
          notification("error", err.message);
        });
    });
    setImage([]);
    setFiles([]);
    // Wait for all uploads to finish
    await Promise.all([...imageUploadPromises, ...fileUploadPromises]);

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
            notification("error", "Insufficient queries remaining!");
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
          throw new Error(`Network response was not ok - ${response.status}`);
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

  const VideoComponent = ({ src, platform }) => {
    switch (platform) {
      case "youtube":
        return (
          <iframe
            width="100%"
            height="315"
            src={`https://www.youtube.com/embed/${src}`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        );
      case "vimeo":
        return (
          <iframe
            width="100%"
            height="315"
            src={`https://player.vimeo.com/video/${src}`}
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          ></iframe>
        );
      case "loom":
        return (
          <iframe
            width="100%"
            height="315"
            src={`https://www.loom.com/embed/${src}`}
            frameBorder="0"
            allowFullScreen
          ></iframe>
        );
      // Handle other platforms or default video tag
      default:
        return (
          <video controls width="100%">
            <source src={src} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        );
    }
  };

  const getVideoPlatform = (url) => {
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      return "youtube";
    } else if (url.includes("vimeo.com")) {
      return "vimeo";
    } else if (url.includes("loom.com")) {
      return "loom";
    }
    return "default";
  };

  const getVideoId = (url, platform) => {
    let id = null;
    if (platform === "youtube") {
      // Extract the video ID from the YouTube URL
      const match = url.match(
        /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i
      );
      id = match ? match[1] : null;
    } else if (platform === "vimeo") {
      // Extract the video ID from the Vimeo URL
      const match = url.match(/vimeo\.com\/(\d+)/);
      id = match ? match[1] : null;
    } else if (platform === "loom") {
      // Extract the video ID from the Loom URL
      const match = url.match(/loom\.com\/share\/([a-zA-Z0-9]+)/);
      id = match ? match[1] : null;
    }
    return id;
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
          <span className="text-[--site-card-icon-color]">loading ...</span>
        </div>
      )}
      <Toaster className="z-30" />
      {chat.access && loading === false && (
        <div className="w-full h-screen lg:py-2">
          <div className="flex flex-col justify-center w-full h-full p-2 lg:items-center lg:px-10 lg:py-0 min-h-max">
            {chatbot_start ? (
              <div className="flex flex-col items-center justify-center h-full gap-5">
                <img
                  src={
                    chat.chat_logo.url ||
                    "https://interactive-tutor-staging-public-asset.s3.eu-west-2.amazonaws.com/default_ai.png"
                  }
                  ref={chatbot_logo}
                  alt="Logo"
                />
                <h1 ref={chatbot_title}>{chat.chat_title.description}</h1>
                <span ref={chatbot_description}>
                  {chat.chat_description.description}
                </span>
              </div>
            ) : (
              <div
                className="w-full pt-10 text-base font-medium h-4/5"
                name="main_scroll"
              >
                <Scrollbar ref={messagesEndRef} name="scroll content">
                  <ChatBox chats={chathistory} isStreamData={false} />
                  {spinner === true && (
                    <ChatBox
                      chats={[
                        {
                          role: "ai",
                          content: streamData,
                        },
                      ]}
                      isStreamData={true}
                      isThinking={state}
                    />
                  )}
                </Scrollbar>
              </div>
            )}

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
              <div className="flex flex-col items-center w-full divide-x-2 sm:w-4/5 md:gap-2 gap-1">
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
                  <span
                    onClick={handleSubmitIcon}
                    className="flex p-3 absolute right-0 top-1/2 -translate-y-1/2"
                  >
                    <IconButton className=" bg-black w-8 h-8 rounded-md">
                      <BsFillSendPlusFill className="w-5 h-5" />
                    </IconButton>
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 w-full">
                  {image &&
                    image.length > 0 &&
                    image.map((item, index) => {
                      return (
                        <div className="relative" key={index}>
                          <img
                            src={URL.createObjectURL(item)}
                            alt="file"
                            className="w-10 h-10"
                          />
                          <AiOutlineClose
                            onClick={() => handleRemoveImage(index)}
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
                        <div className="relative" key={index}>
                          {FileIcon}
                          <p className="truncate w-16">{file.name}</p>
                          <AiOutlineClose
                            onClick={() => handleRemoveFile(index)}
                            className="absolute w-4 h-4 top-0 right-0 text-white rounded-full bg-red-600"
                          />
                        </div>
                      );
                    })}
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
