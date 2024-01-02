import { useState, useEffect } from "react";
import Select from "react-select";
import { webAPI } from "../utils/constants";
import axios from "axios";
import { useSelector } from "react-redux";
import toast, { Toaster } from "react-hot-toast";
import { Scrollbar } from "react-scrollbars-custom";
import {
  Progress,
  DialogHeader,
  Dialog,
  DialogBody,
  DialogFooter,
  Spinner,
  Button,
} from "@material-tailwind/react";

import WONDE from "../assets/wonde.gif";

const ChatmodalTrain = (props) => {
  const [type, SetType] = useState(1);
  const [label, SetLabel] = useState("");
  const [url, Seturl] = useState("");
  const [file, setFile] = useState("");
  const [text, setText] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [check, setCheck] = useState(false);
  const [progress, setProgress] = useState(0);
  const [value, setValue] = useState("");
  const [isloading, setIsloading] = useState(false);
  const [isurlloading, setIsurlloading] = useState(false);
  const chat = JSON.parse(useSelector((state) => state.chat.chat));
  const user = JSON.parse(useSelector((state) => state.user.user));
  const notification = (type, message) => {
    // To do in here
    if (type === "error") {
      toast.error(message);
    }
    if (type === "success") {
      toast.success(message);
    }
  };
  let poll;

  const handleClick = () => {
    setIsChecked(!isChecked);
  };

  const urlPatternValidation = (url) => {
    const regex = new RegExp(
      "^(https?://)([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?"
    );
    return regex.test(url);
  };

  const getapikey = () => {
    axios
      .post(webAPI.getapikey, { id: user.id })
      .then((res) => {
        setValue(res.data.data);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const onOK = () => {
    let chatbot = chat.uuid;
    if (type === "1") {
      if (urlPatternValidation(url)) {
        setIsurlloading(true);
        let data;
        data = { url, chatbot };
        axios
          .post(webAPI.sendurl, data)
          .then((res) => {
            if (res.data.code === 401) {
              notification("error", res.data.message);
            }
            props.handleOk(res.data.data);
            setIsurlloading(false);
          })
          .catch((error) => {
            setIsurlloading(false);
          });
      } else {
        notification("error", "Invalued URL");
      }
    } else if (type === "2") {
      if (file && file.name) {
        let data = new FormData();
        let chatbot = chat.uuid;
        const filename = file.name.replaceAll(" ", "");
        data.append("file", file, filename);
        data.append("chatbot", chatbot);
        const config = {
          onUploadProgress: (progressEvent) => {
            const progress = Math.round(
              (progressEvent.loaded / progressEvent.total) * 100
            );
            setProgress(progress);
          },
        };
        axios
          .post(webAPI.sendfile, data, config)
          .then((res) => {
            setIsloading(false);
            if (!res.data.success) {
              notification("error", res.data.message);
              props.handleCancel();
            } else {
              notification("success", res.data.message);
              props.handleOk(res.data.data);
            }
            props.handleOk(res.data.data);
          })
          .catch((err) => {
            notification("error", "Failed Uploading File");
            setIsloading(false);
          });
      }
    } else if (type === "3") {
      let data;
      data = { text, chatbot };
      axios
        .post(webAPI.sendtext, data)
        .then((res) => {
          props.handleOk(res.data.data);
        })
        .catch((err) => console.log(err));
    } else {
      if (user.role === 7) {
        if (value === "") {
          notification("error", "Please input the API key");
          return;
        } else {
          axios
            .post(webAPI.getapikey, { id: user.id })
            .then((res) => {
              if (res.data.data !== value) {
                axios
                  .post(webAPI.sendapikey, {
                    id: user.id,
                    apikey: value,
                    chatbot: chat.uuid,
                  })
                  .then((res) => {
                    notification("success", res.data.message);
                    props.handleOk(res.data.data);
                  })
                  .catch((err) => console.log(err));
              } else {
                let data = {
                  chatbot: chat.uuid,
                  api: isChecked ? 1 : 0,
                };
                if (chatbot) {
                  axios
                    .post(webAPI.sendapi, data)
                    .then((res) => {
                      notification("success", res.data.message);
                      props.handleOk(res.data.data);
                    })
                    .catch((err) => console.log(err));
                } else {
                  notification("error", "Your chatbot is not created yet.");
                  return;
                }
              }
            })
            .catch((err) => console.log(err));
        }
      } else {
        let data = { chatbot: chat.uuid, api: isChecked ? 1 : 0 };
        if (chatbot) {
          axios
            .post(webAPI.sendapi, data)
            .then((res) => {
              notification("success", res.data.message);
              props.handleOk(res.data.data);
            })
            .catch((err) => console.log(err));
        } else {
          notification("error", "Your chatbot is not created yet.");
          return;
        }
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const checkUser = () => {
    if (user) {
      axios
        .post(webAPI.checkUserInvite, { id: user.id })
        .then((res) => {
          if (res.data.success) {
            setCheck(true);
          } else {
            setCheck(false);
          }
        })
        .catch((err) => console.error(err));
    }
  };

  useEffect(() => {
    checkUser();
    setProgress(0);
    Seturl("");
    setText("");
    getapikey();
    // SetType("1")
    clearInterval(poll);
    if (chat.api_select && chat.api_select === 1) {
      setIsChecked(true);
    } else {
      setIsChecked(false);
    }
  }, [props.open]);

  useEffect(() => {
    if (progress === 100) {
      setIsloading(true);
    }
  }, [progress]);

  const customStyles = {
    control: (provided) => ({
      ...provided,
      background: "transparent", // Adjust as needed
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "black", // Replace with your placeholder text color
    }),
    menu: (provided) => ({
      ...provided,
      background:
        "linear-gradient(to bottom right, [--site-main-modal-from-color], [--site-main-modal-to-color])", // Replace with your gradient colors
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.25)", // Replace with your shadow style
    }),
  };

  // const displayValue = value.replace(/.(?=.{4})/g, '*');

  const handleInputChange = (e) => {
    setValue(e.target.value);
  };

  return (
    <Dialog
      open={props.open}
      size={"lg"}
      handler={props.handleCancel}
      className="border-[--site-chat-header-border] border rounded-md shadow-lg shadow-[--site-onboarding-primary-color]"
    >
      <Toaster className="z-30" />
      <DialogHeader className="px-8 pt-8 pb-6">
        <span className="text-[32px] leading-12 font-semibold text-[--site-onboarding-primary-color]">
          Add Training Data
        </span>
      </DialogHeader>
      <DialogBody className="border-t border-[--site-main-modal-divide-color] text-black text-base font-medium flex flex-col h-[25rem]">
        <Scrollbar>
          <div className="mr-4">
            {user && (
              <div className="flex flex-col gap-6 px-8 py-5">
                <div className="flex flex-col items-start gap-2">
                  <label className="text-base font-medium">Data Type</label>
                  <Select
                    styles={customStyles}
                    isSearchable={false}
                    className="w-full border-[--site-main-modal-input-border-color] border rounded-md"
                    onChange={(e) => {
                      SetType(e.value);
                    }}
                    // defaultValue={{
                    //     value: "1",
                    //     label: "URLs",
                    // }}
                    options={
                      user.role === 7 ||
                      user.role === 1 ||
                      (user.role === 4 && check)
                        ? [
                            {
                              value: "1",
                              label: "URLs",
                            },
                            {
                              value: "2",
                              label: "Files",
                            },
                            {
                              value: "3",
                              label: "Texts",
                            },
                            {
                              value: "4",
                              label: "APIs",
                            },
                          ]
                        : [
                            {
                              value: "1",
                              label: "URLs",
                            },
                            {
                              value: "2",
                              label: "Files",
                            },
                            {
                              value: "3",
                              label: "Texts",
                            },
                          ]
                    }
                  />
                  <p className="text-start">
                    Please select the type of content you want to provide: URLs,
                    files, or text.
                  </p>
                </div>

                <div className="p-6 border-[--site-main-modal-input-border-color] border rounded-md">
                  {type === "1" && (
                    <div className="flex flex-col items-start gap-2">
                      <label className="text-base font-medium">
                        URL (Required)
                      </label>
                      <input
                        type="url"
                        name="label"
                        value={url}
                        onChange={(e) => {
                          Seturl(e.target.value);
                        }}
                        placeholder="https://example.com"
                        className="w-full h-10 px-5 py-3 bg-transparent border-[--site-main-modal-input-border-color] border rounded-md placeholder:text-black placeholder:opacity-50"
                      />
                      {!label && (
                        <p className="text-[12px] text-[--site-main-form-error]">
                          * URL is required.
                        </p>
                      )}
                      {isurlloading && (
                        <div className="flex flex-col items-center justify-center w-full p-2">
                          <Spinner color="pink" className="w-32 h-32" />
                          <span className="absolute">
                            <div className="flex">
                              <span className="h-full">Embedding</span>
                            </div>
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                  {type === "2" && (
                    <div className="flex flex-col items-start gap-2">
                      <label className="text-base font-medium">
                        Add file(s) (Required)
                      </label>
                      <input
                        type="file"
                        name="label"
                        onChange={(e) => handleFileChange(e)}
                        accept=".pdf,.csv,.docx, .srt, .epub, .txt,
                    .md, .json"
                        max="100000000"
                        className="block w-full text-sm border rounded-md text-black file:mr-4 file:py-2 file:px-4 file:rounded-md file:border file:text-sm file:font-medium file:bg-[--site-onboarding-primary-color] file:border-[--site-main-modal-input-border-color] file:text-white hover:file:opacity-75 border-[--site-main-modal-input-border-color]"
                      />
                      <p className="text-sm text-start">
                        Accepted formats : .pdf, .csv, .docx, .srt, .epub, .txt,
                        .md, .json, - Max file size: 100MB
                      </p>
                      {progress > 0 && progress < 100 && (
                        <div className="flex flex-col w-full">
                          <div className="flex flex-col items-center justify-between w-full mb-2">
                            <div className="flex w-full">
                              <Progress
                                value={progress}
                                size="md"
                                color="green"
                                className="border-[--site-main-modal-input-border-color] border"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                      {isloading && (
                        <div className="flex flex-col items-center justify-center w-full p-2">
                          <Spinner color="pink" className="w-32 h-32" />
                          <span className="absolute">
                            <div className="flex">
                              <span className="h-full">Embedding</span>
                            </div>
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                  {type === "3" && (
                    <div className="flex flex-col items-start gap-2">
                      <label className="text-base font-medium">
                        Text (Required)
                      </label>
                      <textarea
                        type="text"
                        cols={50}
                        rows={5}
                        onChange={(e) => setText(e.target.value)}
                        className="w-full min-h-40 px-5 py-3 bg-transparent border-[--site-main-modal-input-border-color] border rounded-md placeholder:text-black placeholder:opacity-50"
                      />
                    </div>
                  )}
                  {(user.role === 7 ||
                    user.role === 1 ||
                    (user.role === 4 && check)) &&
                    type === "4" && (
                      <div className="flex flex-col items-start gap-2">
                        <label className="text-base font-medium">
                          Only school admins can connect to an API
                        </label>
                        <div className="flex items-center justify-left gap-4 w-1/2">
                          <div className="relative">
                            <img
                              src={WONDE}
                              alt="wonde"
                              className="w-20 h-20 rounded-lg shadow-xl"
                              onClick={(e) => handleClick()}
                            />
                            {isChecked && (
                              <img
                                width="24"
                                height="24"
                                src="https://img.icons8.com/fluency/48/approval.png"
                                alt="approval"
                                className=" absolute top-0 right-0 m-1"
                              />
                            )}
                          </div>
                          {user.role === 7 ? (
                            <input
                              type="text"
                              value={value}
                              onChange={handleInputChange}
                              disabled={!isChecked}
                              autoComplete="off"
                              className="w-full h-10 px-5 py-3 bg-transparent border-[--site-main-modal-input-border-color] border rounded-md"
                            />
                          ) : (
                            <span className="w-full px-5 py-3 bg-transparent border-[--site-main-modal-input-border-color] border rounded-md">
                              Restricted to admins
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            )}
          </div>
        </Scrollbar>
      </DialogBody>
      <DialogFooter className="flex items-center justify-end gap-4 px-10 pb-8">
        <Button
          onClick={props.handleCancel}
          className=" normal-case bg-transparent border-[--site-onboarding-primary-color] text-[--site-onboarding-primary-color] text-base font-semibold border rounded-md px-4 py-2"
        >
          cancel
        </Button>
        <Button
          onClick={onOK}
          className=" normal-case px-4 py-2 text-base font-semibold text-white bg-[--site-onboarding-primary-color] rounded-md disabled:opacity-75"
        >
          confirm
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default ChatmodalTrain;
