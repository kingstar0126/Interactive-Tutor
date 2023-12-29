import React, { useEffect, useState } from "react";
import {
  Button,
  Avatar,
  Tabs,
  TabsHeader,
  TabsBody,
  Tab,
  Rating,
  TabPanel,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Tooltip,
  IconButton,
} from "@material-tailwind/react";
import { HiOutlineDotsCircleHorizontal } from "react-icons/hi";
import { MdOutlineArrowBackIos, MdAdd } from "react-icons/md";
import { IoMdRemoveCircle } from "react-icons/io";
import { BsBookmarkFill } from "react-icons/bs";
import { useLocation, useNavigate } from "react-router-dom";
import ReviewItem from "./ReviewItem";
import ImageUploader from "react-image-upload";
import "react-image-upload/dist/index.css";
import axios from "axios";
import { webAPI } from "../utils/constants";
import toast, { Toaster } from "react-hot-toast";
import RecommendItem from "./RecommendItem";

import image0 from "../assets/0.svg";
import image1 from "../assets/1.svg";
import image2 from "../assets/2.svg";
import image3 from "../assets/3.svg";
import image4 from "../assets/4.svg";
import image5 from "../assets/5.svg";
import image6 from "../assets/6.svg";
import image7 from "../assets/7.svg";
import image8 from "../assets/8.svg";
import bronze from "../assets/bronzeaward.svg";
import silver from "../assets/silveraward.svg";
import gold from "../assets/goldaward.svg";

const Badges = [
  image0,
  image1,
  image2,
  image3,
  image4,
  image5,
  image6,
  image7,
  image8,
  bronze,
  silver,
  gold,
];

const ToolTips = [
  "Awarded to AI Bots demonstrating unique and creative teaching methods.",
  "For AI Bots that effectively navigate and utilize digital resources in the classroom.",
  "Awarded to AI Bots that foster teamwork and collaboration among students.",
  "For AI Bots showcasing exceptional proficiency in integrating technology into education.",
  "For AI Bots showcasing exceptional proficiency in integrating technology into education.",
  "For AI Bots specializing in teaching and enhancing language skills.",
  "Given to AI Bots demonstrating excellence in teaching complex mathematical concepts.",
  "For AI Bots that inspire curiosity and innovation in science subjects.",
  "Awarded to AI Bots that effectively incorporate cultural awareness and diversity into learning.",
  "5 Downloads",
  "20 Downloads",
  "50 Downloads",
];

const ItemDescription = () => {
  const [activeTab, setActiveTab] = useState("description");
  const [file, setFile] = useState(null);
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [email, setEmail] = useState("");
  const [isAddBadgeModal, setIsAddBadgeModal] = useState(false);
  const [isAddLibraryModal, setIsAddLibraryModal] = useState(false);
  const [chats, setChats] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();
  const chat = location.state.chat;
  const page = location.state.page;

  const getImageFileObject = (imageFile) => {
    setFile(imageFile.file);
  };

  const runAfterImageDelete = () => {
    setFile(null);
  };

  const getAllReviews = () => {
    axios
      .post(webAPI.getreviews, { chat })
      .then((res) => setReviews(res.data.data));
  };

  const handleAddBadge = (id) => {
    axios.post(webAPI.addbadge, { chat, badge: id }).then((res) => {
      if (res.data.success) {
        toast.success("Success!");
      } else {
        toast.error("Error!");
      }
    });
    setIsAddBadgeModal(false);
  };

  useEffect(() => {
    getAllReviews();
    getPublishChats();
  }, []);

  const getPublishChats = () => {
    axios
      .post(webAPI.getpublishchats, {
        menu: chat.menu,
        subMenu: 0,
        sortby: 0,
        page: 1,
        perpage: 6,
      })
      .then((res) => {
        setChats(res.data.data);
      })
      .catch((err) => console.error(err));
  };

  const handleSubmit = () => {
    if (username && message && rating && file) {
      const formData = new FormData();
      const filename = file.name.replace(" ", "");
      formData.append("file", file, filename);
      formData.append("username", username);
      formData.append("message", message);
      formData.append("rating", rating);
      formData.append("chat", JSON.stringify(chat));
      axios.post(webAPI.sendreview, formData).then((res) => {
        if (res.data.success) {
          toast.success("You successfully submitted");
        } else {
          toast.error(res.data.message);
        }
      });
    } else {
      toast.error("Please fill in your information");
    }
  };

  const data = [
    {
      label: "Description",
      value: "description",
      desc: (
        <div className="flex flex-col gap-2 text-sitePrimary">
          <span className=" font-semibold text-2xl">Description Title</span>
          <p>{chat.description}</p>
        </div>
      ),
    },
    {
      label: "Reviews",
      value: "reviews",
      desc: (
        <div className="flex flex-col gap-4 text-sitePrimary">
          <span className="font-semibold text-2xl">Reviews</span>
          <div className="flex flex-col">
            <label>Your name</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="rounded-md border border-gray-500 p-2"
            />
          </div>
          <div className="flex flex-col">
            <label>Upload Photo or Avatar</label>
            <ImageUploader
              className="w-10 h-10 rounded-md"
              onFileAdded={(img) => getImageFileObject(img)}
              onFileRemoved={(img) => runAfterImageDelete(img)}
              deleteIcon={<IoMdRemoveCircle />}
              uploadIcon={<MdAdd className="w-10 h-10" />}
            />
          </div>
          <div className="flex flex-col">
            <label>Write Your Review</label>
            <textarea
              cols={50}
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your review..."
              className="rounded-md border border-gray-500 p-2"
            />
          </div>
          <div className="flex gap-2">
            <label>Overall rating</label>
            <Rating value={rating} onChange={(value) => setRating(value)} />
          </div>
          <div className="flex">
            <Button
              className=" normal-case bg-sitePrimary py-4 px-8 rounded-md"
              onClick={() => handleSubmit()}
            >
              Submit
            </Button>
          </div>

          <div className=" overflow-y-scroll max-h-[30rem] flex flex-col gap-4">
            {reviews.map((review, id) => (
              <ReviewItem review={review} key={id} />
            ))}
          </div>
        </div>
      ),
    },
  ];

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (
        ((num / 1000000).toFixed(1).replace(/\.0$/, "") * 1).toLocaleString() +
        "M"
      );
    } else if (num >= 1000) {
      return (
        ((num / 1000).toFixed(1).replace(/\.0$/, "") * 1).toLocaleString() + "K"
      );
    } else {
      return num.toLocaleString();
    }
  };

  const handleAddLibrary = () => {
    setIsAddLibraryModal(false);
    axios.post(webAPI.sendemail, { email, chat }).then((res) => {
      if (res.data.success) {
        toast.success(res.data.message);
      } else {
        toast.error(res.data.message);
      }
    });
  };
  const handleItemClick = (chat) => {
    navigate("/itemdescription", { state: { chat, page } });
  };

  const getSubMenus = (menu) => {
    if (menu === 1) {
      return "Role";
    } else if (menu === 2) {
      return "Subject";
    } else if (menu === 3) {
      return "Task";
    } else {
      return "Just For Fun";
    }
  };
  return (
    <div className="container items-center justify-center m-auto py-5">
      <Toaster />
      <div className="flex flex-col gap-4">
        <div className="flex w-full justify-start items-center">
          <Button
            className="flex items-center gap-3"
            variant="outlined"
            onClick={() => navigate("/", { state: { page } })}
          >
            <MdOutlineArrowBackIos className="w-5 h-5" />
            Back
          </Button>
        </div>
        <div className="flex md:flex-row flex-col gap-2 md:gap-0">
          <div className="md:w-1/2 flex flex-col md:gap-4 gap-2 md:py-4 justify-between">
            <div className="flex flex-wrap gap-2 h-[4rem] py-2">
              <span className="px-2 rounded-full bg-chipColor h-5 flex items-center justify-center">
                {getSubMenus(chat.menu)}
              </span>
            </div>
            <span className="font-bold md:text-5xl text-2xl">{chat.label}</span>

            <div className="flex flex-col gap-2 justify-center">
              <div className="flex gap-2 items-center">
                {chat.status ? (
                  <div className="flex gap-2 items-center">
                    <Avatar src={chat.url} alt="avatar" className="w-12 h-12" />
                    <span className="font-semibold md:text-2xl text-lg">
                      {chat.username} {chat.userrole}
                    </span>
                  </div>
                ) : (
                  <div className="flex gap-2 items-center">
                    <Avatar
                      src={chat.chat_logo.user}
                      alt="avatar"
                      className="w-12 h-12"
                    />
                    <span className="font-semibold md:text-2xl text-lg">
                      {chat.name}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex gap-2 items-center pl-2">
                <BsBookmarkFill className="text-yellow-700 w-6 h-6" />
                <span className=" font-medium md:text-lg text-base">
                  {formatNumber(chat.downloads)}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 items-center">
              {chat.badge &&
                chat.badge.map((id) => (
                  <Tooltip
                    content={<span className=" text-wrap">{ToolTips[id]}</span>}
                    className="bg-white text-black shadow-lg"
                    animate={{
                      mount: { scale: 1, y: 0 },
                      unmount: { scale: 0, y: 25 },
                    }}
                  >
                    <img
                      src={Badges[id]}
                      className="rounded-full w-14 h-14"
                      key={id}
                    />
                  </Tooltip>
                ))}
              <IconButton
                variant="outlined"
                className="rounded-full"
                onClick={() => setIsAddBadgeModal(true)}
              >
                <MdAdd className="w-14 h-14 p-2" />
              </IconButton>
            </div>
            <div className="flex items-center justify-start">
              <Button
                className="normal-case bg-sitePrimary text-white"
                onClick={() => setIsAddLibraryModal(true)}
              >
                Add to library
              </Button>
            </div>
          </div>
          <div className="md:w-1/2 flex items-center justify-center">
            <img
              src={chat.chat_logo.url || chat.chat_logo.ai}
              alt="logo"
              className="w-full md:w-3/4"
            />
          </div>
        </div>
        <div className="w-full">
          <Tabs value={activeTab}>
            <TabsHeader
              className="rounded-none border-b border-blue-gray-50 bg-transparent p-0 max-w-[20rem] pb-3"
              indicatorProps={{
                className: "bg-tabHeader shadow-none rounded-full",
              }}
            >
              {data.map(({ label, value }) => (
                <Tab
                  key={value}
                  value={value}
                  onClick={() => setActiveTab(value)}
                  className={activeTab === value ? "text-white" : "text-black"}
                >
                  <div className="flex items-center justify-center gap-2">
                    <HiOutlineDotsCircleHorizontal />
                    {label}
                  </div>
                </Tab>
              ))}
            </TabsHeader>
            <TabsBody>
              {data.map(({ value, desc }) => (
                <TabPanel key={value} value={value}>
                  {desc}
                </TabPanel>
              ))}
            </TabsBody>
          </Tabs>
        </div>
        <div className="w-full flex gap-2">
          {chats && chats.filter(item => item.id !== chat.id).map((_chat, idx) => (
            <div onClick={() => handleItemClick(_chat)} key={idx}>
              <RecommendItem key={idx} data={_chat} />
            </div>
          ))}
        </div>
      </div>

      <Dialog
        open={isAddBadgeModal}
        handler={() => setIsAddBadgeModal(false)}
        className="rounded-md shadow-lg"
      >
        <DialogHeader>Add Badge</DialogHeader>
        <DialogBody divider>
          <div className="flex flex-wrap gap-3">
            {Badges.filter((_, id) => id < 9).map((item, id) => (
              <Tooltip
                content={<span className=" text-wrap">{ToolTips[id]}</span>}
                className="bg-white text-black shadow-lg z-[99999]"
                animate={{
                  mount: { scale: 1, y: 0 },
                  unmount: { scale: 0, y: 25 },
                }}
              >
                <img
                  src={item}
                  key={id}
                  className="w-16 h-16 hover:cursor-pointer"
                  onClick={() => handleAddBadge(id)}
                />
              </Tooltip>
            ))}
          </div>
        </DialogBody>
        <DialogFooter className="flex items-center justify-end gap-4 pb-8"></DialogFooter>
      </Dialog>

      <Dialog
        open={isAddLibraryModal}
        handler={() => setIsAddLibraryModal(false)}
        className="rounded-md shadow-lg"
      >
        <DialogHeader></DialogHeader>
        <DialogBody divider>
          <label className="text-sitePrimary">Input your email</label>
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rouned-md border border-sitePrimary p-2 w-full text-sitePrimary"
          />
        </DialogBody>
        <DialogFooter className="flex items-center justify-end gap-4 pb-8">
          <Button
            variant="outlined"
            className="text-sitePrimary normal-case"
            onClick={() => setIsAddLibraryModal(false)}
          >
            Cancel
          </Button>
          <Button
            className="normal-case text-white bg-sitePrimary"
            onClick={() => handleAddLibrary()}
          >
            Confirm
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
};

export default ItemDescription;
