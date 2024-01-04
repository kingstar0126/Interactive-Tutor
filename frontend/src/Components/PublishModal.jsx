import { useState, useEffect } from "react";
import {
  Dialog,
  DialogBody,
  DialogFooter,
  Button,
} from "@material-tailwind/react";
import axios from "axios";
import { webAPI } from "../utils/constants";
import { SERVER_URL } from "../config/constant";
import Select from "react-select";
import { Scrollbar } from "react-scrollbars-custom";
import toast, { Toaster } from "react-hot-toast";
import Switch from "./Switch";
import Dropzone from "react-dropzone";

const ROLES = [
  "Administrative and Management",
  "Specialist and Technical",
  "Pupil Support and Welfare",
  "Teaching and Learning Support",
  "Extracurricular Activities and Clubs",
  "Health and Safety",
  "Parent and Community Involvement",
];
const SUBJECTS = [
  "English",
  "Mathematics",
  "Science (Biology, Chemistry, Physics)",
  "History",
  "Modern Foreign Languages (e.g., French, Spanish, German, Mandarin)",
  "Classical Languages (e.g., Latin, Greek)",
  "Art",
  "Music",
  "Drama",
  "Design and Technology",
  "Computer Science",
  "Business Studies",
  "Physical Education",
  "Health Education",
  "Special Education",
  "Theologoy, Philosophy & Religious Education",
  "Home Economics",
];

const TASKS = [
  "Educational Delivery",
  "Student Engagement",
  "Assessment and Records",
  "Communication and Development",
  "Technology Integration",
  "Strategic Operations",
  "Policy and Community",
  "Facilities and Safety",
  "Curriculum and Staff Oversight",
  "Data and Analysis",
];

const FUNS = ["Historical Charachters", "Image Generation", "Games", "Misc"];

const PublishModal = (props) => {
  const [chat, setChat] = useState(null);
  const [label, setLabel] = useState("");
  const [chatdescription, setChatdescription] = useState("");
  const [menu, setMenu] = useState(0);
  const [subMenu, setSubMenu] = useState(0);
  const [status, setStatus] = useState(true);
  const [file, setFile] = useState(null);
  const [selectedLogo, setSelectedLogo] = useState(null);
  const [username, setUsername] = useState("");
  const [userrole, setUserrole] = useState("");

  useEffect(() => {
    if (props.chat) {
      setChat(props.chat);
      setLabel(props.chat.label);
      setChatdescription(props.chat.description);
    }
  }, [props.chat]);

  const notification = (type, message) => {
    // To do in here
    if (type === "error") {
      toast.error(message);
    }
    if (type === "success") {
      toast.success(message);
    }
  };

  const handleUpload = async () => {
    if (file) {
      const formData = new FormData();

      const filename = file.name.replace(" ", "");

      formData.append("file", file, filename);
      const response = await axios.post(webAPI.imageupload, formData);
      if (response.data) {
        return SERVER_URL + response.data.data
      }
      else {
        return null
      }
    }
  };

  const handleFileChange = (files) => {
    if (files[0].size > 1024 * 1024) {
      notification("error", "Maximum image size allowed is 1MB.");
      return;
    }
    const imageURL = URL.createObjectURL(files[0]);
    setSelectedLogo(imageURL);
    setFile(files[0]);
  };
  const handleOk = async () => {
    if (!label || !chatdescription) {
      notification("error", "Please select all fileds");
      return;
    }
    const url = await handleUpload();
    chat.label = label;
    chat.description = chatdescription;
    chat.status = status;
    chat.username = username;
    chat.menu = menu;
    chat.subMenu = subMenu;
    chat.userrole = userrole;
    chat.url = url;

    props.handleOk(chat);
  };

  const getSubMenus = () => {
    if (menu === 1) {
      return ROLES;
    } else if (menu === 2) {
      return SUBJECTS;
    } else if (menu === 3) {
      return TASKS;
    } else {
      return FUNS;
    }
  };

  return (
    <Dialog
      open={props.open}
      size={"lg"}
      handler={props.handleCancel}
      className=" border-[--site-chat-header-border] border rounded-md"
    >
      <Toaster />
      <DialogBody className="border-t border-[--site-main-modal-divide-color] text-black text-base font-medium h-[25rem] md:hidden">
        <Scrollbar>
          {chat && (
            <div className="flex flex-col gap-4">
              <div className="flex justify-center items-center w-full">
                <img
                  src={
                    chat.chat_logo.url ? chat.chat_logo.url : chat.chat_logo.ai
                  }
                  alt="Tutor"
                  className="rounded-md max-h-[150px]"
                />
              </div>
              <div className="flex flex-col items-start gap-2">
                <label className=" text-base font-semibold">Label</label>
                <input
                  type="text"
                  name="label"
                  value={label}
                  onChange={(e) => {
                    setLabel(e.target.value);
                  }}
                  autoComplete="off"
                  placeholder="AI-Tutor name"
                  className="w-full h-10 px-5 py-3 bg-transparent border-[--site-onboarding-primary-color] border rounded-md placeholder:text-black/60 placeholder:opacity-50"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className=" text-base font-semibold">Description</label>
                <input
                  type="text"
                  value={chatdescription}
                  onChange={(e) => {
                    setChatdescription(e.target.value);
                  }}
                  autoComplete="off"
                  placeholder="This is my general assistant"
                  className="w-full h-10 px-5 py-3 bg-transparent border-[--site-onboarding-primary-color] border rounded-md placeholder:text-black/60 placeholder:opacity-50"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className=" text-base font-semibold">
                  Select the Category
                </label>
                <div className="flex gap-4 md:flex-row flex-col">
                  <Select
                    onChange={(e) => setMenu(e.value)}
                    className="rounded-md md:w-1/4 border border-[--site-onboarding-primary-color]"
                    placeholder="Select the Menu"
                    options={[
                      { label: "Role", value: 1 },
                      { label: "Subject", value: 2 },
                      { label: "Task", value: 3 },
                      { label: "Just For Fun", value: 4 },
                    ]}
                  />

                  <Select
                    onChange={(e) => setSubMenu(e.value)}
                    className="rounded-md md:w-1/4 border border-[--site-onboarding-primary-color]"
                    placeholder="Subject"
                    options={getSubMenus().map((item, id) => {
                      return { label: item, value: id + 1 };
                    })}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex gap-2 items-center">
                  <Switch
                    handlechange={(toggle) => setStatus(!toggle)}
                    toggle={status}
                  />
                  <label>Publish Anonymously</label>
                </div>
                {status && (
                  <div>
                  <div className="flex gap-2 md:flex-row flex-col py-2">
                    <div className="flex flex-col md:w-1/3 py-2 gap-2 justify-between">
                      <label>Upload Photo or Avatar</label>

                      <Dropzone onDrop={handleFileChange} multiple={false}>
                        {({ getRootProps, getInputProps }) => (
                          <div
                            className="flex w-full h-full dropzone"
                            {...getRootProps()}
                          >
                            <input {...getInputProps()} />
                            {selectedLogo ? (
                              <div className="m-1">
                                <img
                                  src={selectedLogo}
                                  alt="Selected"
                                  className="rounded-md w-full object-contain border border-[--site-onboarding-primary-color]"
                                />
                              </div>
                            ) : (
                              <div className="w-10 h-10 border border-[--site-onboarding-primary-color] rounded-md">
                                <p>Image</p>
                              </div>
                            )}
                          </div>
                        )}
                      </Dropzone>
                    </div>
                    <div className="flex flex-col py-2 gap-4 justify-center">
                      <input
                        type="text"
                        className="rounded-md p-2 border border-[--site-onboarding-primary-color] text-[--site-onboarding-primary-color]"
                        placeholder="UserName"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                      />
                      <input
                        type="text"
                        className="rounded-md p-2 border border-[--site-onboarding-primary-color] text-[--site-onboarding-primary-color]"
                        placeholder="Role"
                        value={userrole}
                        onChange={(e) => setUserrole(e.target.value)}
                      />
                    </div>
                  </div>
                  <span className="flex items-center justify-center">Ensure that AI bots are not published with any sensitive or confidential training data.</span>
                  </div>
                  )}
              </div>
            </div>
          )}
        </Scrollbar>
      </DialogBody>
      <DialogBody className="border-t border-[--site-main-modal-divide-color] text-black text-base font-medium hidden md:block p-5">
        {chat && (
          <div className="flex flex-col gap-4 px-5">
            <div className="flex justify-center items-center w-full">
              <img
                src={
                  chat.chat_logo.url ? chat.chat_logo.url : chat.chat_logo.ai
                }
                alt="Tutor"
                className="rounded-md max-h-[150px]"
              />
            </div>
            <div className="flex flex-col items-start gap-2">
              <label className=" text-base font-semibold">Label</label>
              <input
                type="text"
                name="label"
                value={label}
                onChange={(e) => {
                  setLabel(e.target.value);
                }}
                autoComplete="off"
                placeholder="AI-Tutor name"
                className="w-full h-10 px-5 py-3 bg-transparent border-[--site-onboarding-primary-color] border rounded-md placeholder:text-black/60 placeholder:opacity-50"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className=" text-base font-semibold">Description</label>
              <input
                type="text"
                value={chatdescription}
                onChange={(e) => {
                  setChatdescription(e.target.value);
                }}
                autoComplete="off"
                placeholder="This is my general assistant"
                className="w-full h-10 px-5 py-3 bg-transparent border-[--site-onboarding-primary-color] border rounded-md placeholder:text-black/60 placeholder:opacity-50"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className=" text-base font-semibold">
                Select the Category
              </label>
              <div className="flex gap-4 md:flex-row flex-col">
                <Select
                  onChange={(e) => setMenu(e.value)}
                  className="rounded-md md:w-1/4 border border-[--site-onboarding-primary-color]"
                  placeholder="Select the Menu"
                  options={[
                    { label: "Role", value: 1 },
                    { label: "Subject", value: 2 },
                    { label: "Task", value: 3 },
                    { label: "Just For Fun", value: 4 },
                  ]}
                />

                <Select
                  onChange={(e) => setSubMenu(e.value)}
                  className="rounded-md md:w-1/4 border border-[--site-onboarding-primary-color]"
                  placeholder="Subject"
                  options={getSubMenus().map((item, id) => {
                    return { label: item, value: id + 1 };
                  })}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex gap-2 items-center">
                <Switch
                  handlechange={(toggle) => setStatus(!toggle)}
                  toggle={status}
                />
                <label>Publish Anonymously</label>
              </div>
              {status && (
                <div className="flex gap-2 md:flex-row flex-col py-2">
                  <div className="flex flex-col md:w-1/4 py-2 gap-2 justify-between">
                    <label>Upload Photo or Avatar</label>

                    <Dropzone onDrop={handleFileChange} multiple={false}>
                      {({ getRootProps, getInputProps }) => (
                        <div
                          className="flex w-full h-full dropzone"
                          {...getRootProps()}
                        >
                          <input {...getInputProps()} />
                          {selectedLogo ? (
                            <div className="m-1">
                              <img
                                src={selectedLogo}
                                alt="Selected"
                                className="rounded-md w-[100px] h-[100px] object-contain border border-[--site-onboarding-primary-color]"
                              />
                            </div>
                          ) : (
                            <div className="w-[100px] h-[100px] border border-[--site-onboarding-primary-color] rounded-md items-center justify-center flex">
                              <p>Image</p>
                            </div>
                          )}
                        </div>
                      )}
                    </Dropzone>
                  </div>
                  <div className="flex flex-col py-2 gap-4 justify-end w-2/3">
                    <input
                      type="text"
                      className="rounded-md p-2 border border-[--site-onboarding-primary-color] text-[--site-onboarding-primary-color]"
                      placeholder="UserName"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                    <input
                      type="text"
                      className="rounded-md p-2 border border-[--site-onboarding-primary-color] text-[--site-onboarding-primary-color]"
                      placeholder="Role"
                      value={userrole}
                      onChange={(e) => setUserrole(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogBody>
      <DialogFooter className="flex items-center justify-between gap-4 px-10 pb-8">
        <div className="flex gap-4 justify-end w-full">
          <Button
            onClick={props.handleCancel}
            className=" normal-case bg-transparent border-[--site-onboarding-primary-color] text-[--site-onboarding-primary-color] text-base font-semibold border rounded-md px-4 py-2"
          >
            cancel
          </Button>

          <Button
            onClick={() => handleOk()}
            className=" normal-case px-4 py-2 text-base font-semibold text-white bg-[--site-onboarding-primary-color] rounded-md disabled:opacity-75"
          >
            Publish
          </Button>
        </div>
      </DialogFooter>
    </Dialog>
  );
};

export default PublishModal;
