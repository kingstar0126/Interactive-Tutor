import React, { useState, useRef, useEffect, useMemo } from "react";
import toast, { Toaster } from "react-hot-toast";
import { BiImageAdd } from "react-icons/bi";
import { BsFillSendPlusFill, BsUpload } from "react-icons/bs";
import { CiSquarePlus } from "react-icons/ci";
import { AiOutlineClose } from "react-icons/ai";
import { useSelector, useDispatch } from "react-redux";
import { webAPI } from "../utils/constants";
import { getchat, setchatbot } from "../redux/actions/chatAction";
import axios from "axios";
import { Scrollbar } from "react-scrollbars-custom";
import { getquery } from "../redux/actions/queryAction";
import {
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  IconButton,
} from "@material-tailwind/react";
import { Spinner } from "@material-tailwind/react";
import PDF from "../assets/pdf.png";
import WORD from "../assets/word.jpg";
import XLSX from "../assets/xlsx.png";
import CSV from "../assets/csv.png";
import { useNavigate } from "react-router-dom";
import AWS from "aws-sdk";
import ChatBox from "../common/components/Chats/ChatBox";

const PROMPTS = [
  "Help me create the ultimate lesson plan",
  "Give me ideas for classroom activities and games",
  "Change the reading age of this text",
  `I’d like feedback on what I have written`,
];
// const chatbotID = "9e66b93c-2801-476e-82fe-1f065c1a5797";
const chatbotID = "5cb0f7ca-825b-40eb-b403-e6bf1555b609";
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

const DashBoard = () => {
  const [image, setImage] = useState([]);
  const [files, setFiles] = useState([]);
  const [message, setMessage] = useState("");
  const [chathistory, setChathistory] = useState([]);
  const [spinner, setSpinner] = useState(false);
  const [loading, setLoading] = useState(false);
  const [streamData, setStreamData] = useState("");
  const chatState = useSelector((state) => state.chat.chat);
  const chat = (chatState && JSON.parse(chatState)) || {};
  const chatbot = useSelector((state) => state.chat.chatbot);
  const user = JSON.parse(useSelector((state) => state.user.user));
  const [inputHeight, setInputHeight] = useState(2 * STEP);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const imageInput = useRef(null);
  const fileInput = useRef(null);
  const notification = (type, message) => {
    // To do in here
    if (type === "error") {
      toast.error(message);
    }
  };

  const handleGetChat = () => {
    axios
    .post(webAPI.getchat, {
      id: chatbotID,
    })
    .then((res) => {
      if (res.data.success) {
        getchat(dispatch, res.data.data);
        setchatbot(dispatch, res.data.data);
        setChathistory([]);
      } else {
        notification('error', res.data.message);
        setLoading(false);
      }
    });
  }

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    handleGetChat();
  }, []);

  useEffect(() => {
    if (chatbot === "") {
      setLoading(true);
    } else {
      setLoading(false);
    }
  }, [chatbot]);

  const chatstate = useMemo(() => {
    if (chathistory.length > 0) {
      return false;
    }
    return true;
  }, [chathistory]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollToBottom();
    }
  }, [chathistory, streamData]);

  const handleSubmit = async (event) => {
    if (!event.shiftKey && event.keyCode === 13 && spinner === false) {
      let id = chatbot || chatbotID;
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
      event.preventDefault();
      setMessage("");
      await sendMessage(id, _message);
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
      setMessage("");
      await sendMessage(id, _message);

      event.preventDefault();
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
    setMessage("");
    await sendMessage(id, _message);
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
    // Create a new FormData to send the necessary data
    const formData = new FormData();
    formData.append("id", id);
    formData.append("_message", _message);
    formData.append("behaviormodel", behaviormodel);
    formData.append("train", train);
    formData.append("model", model);
    formData.append("user_id", user.id);
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

    fetch(webAPI.sendchat, {
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
            console.log(res);
            setSpinner(false);
            return;
          }
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

  const handleMessage = (e) => {
    const lines = Math.max(e.target.value.split("\n").length, 2);
    setInputHeight(Math.min(lines * STEP, 80));
    setMessage(e.target.value);
  };

  return (
    <>
      <div className="flex flex-col justify-center w-full h-screen p-2 lg:items-center lg:px-10 lg:py-0 min-h-max">
        <Toaster />
        {loading && (
          <div className="w-full h-full flex items-center justify-center">
            <Spinner color="pink" className="w-32 h-32" />
          </div>
        )}
        {loading === false && (
          <>
            {chatstate ? (
              <div className="flex flex-col items-center justify-center gap-10 h-4/5">
                <div className="h-2/3 flex flex-col items-center justify-center gap-10">
                  <img
                    src="https://interactive-tutor-staging-public-asset.s3.eu-west-2.amazonaws.com/default_ai.png"
                    alt="Logo"
                    className="w-20 h-20"
                  />
                  <span className="text-center md:text-4xl text-2xl">
                    How can I help you today?
                  </span>
                </div>
                <div className="h-1/3 w-full flex flex-wrap-reverse justify-between overflow-hidden lg:px-8 mb-4">
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
            ) : (

              <div
                className="w-full pt-10 text-base font-medium h-4/5"
                name="main_scroll"
              >
                <Scrollbar ref={messagesEndRef} name="scroll content">
                  <ChatBox chats={chathistory} isStreamData={false} />
                  {spinner === true && (
                    <ChatBox chats={[{
                      role: "ai",
                      content: streamData
                    }]} isStreamData={true} />
                  )}
                </Scrollbar>
              </div>
            )}
            <div className="flex flex-col items-center justify-start w-full h-1/5 lg:px-10 px-2 mt-6">
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
              <div className="flex items-center w-full divide-x-2 flex-col md:gap-2 gap-1">
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
                  <span
                    onClick={handleClickSubmitIcon}
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
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default DashBoard;
