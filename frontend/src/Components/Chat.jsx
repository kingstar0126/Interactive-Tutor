import { BsFillPlayFill } from "react-icons/bs";
import { AiOutlineUser, AiOutlineMenu } from "react-icons/ai";
import { useState, useEffect, useRef } from "react";
import Chatmodal from "./Chatmodal";
import ChatTable from "./ChatTable";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { webAPI } from "../utils/constants";
import { useNavigate } from "react-router-dom";
import { Outlet, useLocation } from "react-router-dom";
import { getUserState } from "../redux/actions/userAction";
import { setquery } from "../redux/actions/queryAction";
import ReactSpeedometer from "react-d3-speedometer";
import { setOpenSidebar } from "../redux/actions/locationAction";
import {
    MdOutlineUpdate,
    MdArrowDropDown,
    MdArrowDropUp,
} from "react-icons/md";

import { Carousel } from "@material-tailwind/react";
import data1 from "../assets/movie/data1.webm";
import data2 from "../assets/movie/data2.webm";
import data3 from "../assets/movie/data3.webm";
import data4 from "../assets/movie/data4.webm";
import data5 from "../assets/movie/data5.webm";

const Chat = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const notification = (type, message) => {
        // To do in here
        if (type === "error") {
            toast.error(message);
        }
        if (type === "success") {
            toast.success(message);
        }
    };
    const [chat, SetChat] = useState([]);
    const user = JSON.parse(useSelector((state) => state.user.user));
    const query = useSelector((state) => state.query.query);
    const _chat = JSON.parse(useSelector((state) => state.chat.chat));
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isOpen, setIsOpen] = useState(true);
    const [trial, setTrial] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const videosRef = useRef([]);
    const [showDescription, setShowDescription] = useState("block");
    const dispatch = useDispatch();
    const handleOpenSidebar = () => {
        dispatch(setOpenSidebar());
    };
    const showModal = () => {
        setIsModalOpen(true);
    };

    const togglePlay = (index) => {
        const video = videosRef.current[index];

        if (video.paused) {
            video.play();
        } else {
            video.pause();
        }

        setIsPlaying(!video.paused);
    };

    const handleOk = (data) => {
        data["user_id"] = user.id;
        axios.post(webAPI.addchat, data).then((res) => {
            if (!res.data.success) {
                notification("error", res.data.message);
            } else {
                notification("success", res.data.message);
                getChats();
            }
        });
        setIsModalOpen(false);
    };
    const handleCancel = () => {
        setIsModalOpen(false);
    };

    useEffect(() => {
        if (isOpen) {
            setShowDescription(
                "flex bg-gradient-to-r from-[--site-chat-header-from-color] to-[--site-chat-header-to-color] border-[--site-chat-header-border] border md:p-6 p-4 gap-8 w-full rounded-2xl shadow-xl shadow-[--site-chat-header-border] md:flex-row flex-col"
            );
        } else {
            setShowDescription("hidden");
        }
    }, [isOpen]);

    useEffect(() => {
        getUserState(dispatch, { id: user.id });
        setquery(dispatch, user.query);
        if (user.role === 5) {
            setTrial(user.days);
            getChats();
        } else if (user.role === undefined || user.role === 0) {
            navigate("/chatbot/subscription");
        } else {
            getChats();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const getChats = async () => {
        let data = {
            user_id: user.id,
        };

        await axios.post(webAPI.getchats, data).then((res) => {
            SetChat(res.data.data);
        });
    };

    return (
        <div>
            <Toaster />
            <div className="flex md:items-center items-end justify-between w-full md:h-[100px] md:px-10 from-[--site-chat-header-from-color] to-[--site-chat-header-to-color] md:border-b-[--site-chat-header-border] md:border md:bg-gradient-to-r px-4 py-2 max-h-min gap-1">
                <div className="hidden md:flex gap-2 mt-9 mb-8 text-[--site-card-icon-color]">
                    <AiOutlineUser className="w-8 h-8" />
                    <span className="text-2xl font-semibold">Tutors</span>
                </div>
                <AiOutlineMenu
                    onClick={handleOpenSidebar}
                    className="w-6 h-6 mb-1 md:hidden"
                />
                <div className="flex items-end justify-end md:mt-[27px] md:mb-[30px]">
                    {_chat && _chat.organization && (
                        <div className="xl:flex flex-col items-start justify-center mr-2 p-2 bg-[--site-warning-text-color] rounded shadow-2xl hidden">
                            <p>
                                <span className="font-bold text-[14px]">
                                    Organisation ID:{" "}
                                </span>
                                <span className="text-[--site-error-text-color] font-semibold">
                                    {_chat.organization}
                                </span>
                            </p>
                        </div>
                    )}
                    {query && (
                        <p className="bg-[--site-logo-text-color] p-2 rounded gap-2 items-center justify-center h-full flex md:mr-0">
                            <span className="text-[--site-error-text-color] font-semibold text-[12px] md:text-base">
                                {query}
                            </span>
                            <span className="text-[--site-card-icon-color] text-[12px] md:text-base font-medium">
                                Queries
                            </span>
                        </p>
                    )}
                    {trial > 0 && (
                        <div className="flex items-end justify-end md:w-max scale-75 md:scale-100 ml-[-20px] mr-[-23px] md:mr-0 translate-y-2 md:translate-y-0">
                            <ReactSpeedometer
                                maxSegmentLabels={0}
                                segments={4}
                                width={100}
                                height={58}
                                ringWidth={10}
                                value={14 - trial}
                                needleColor="black"
                                needleHeightRatio={0.5}
                                maxValue={14}
                                startColor={"#f5da42"}
                                endColor={"#ff0000"}
                            />
                        </div>
                    )}
                    <button
                        onClick={() => navigate("/chatbot/subscription")}
                        className="flex p-2 rounded bg-[--site-logo-text-color] text-[--site-card-icon-color] ml-2"
                    >
                        <MdOutlineUpdate className="w-4 h-4 md:w-6 md:h-6" />
                        <span className="md:text-base text-[12px] font-medium">
                            Upgrade
                        </span>
                    </button>

                    <button
                        className="p-2 flex justify-center items-center bg-[--site-logo-text-color] rounded text-[--site-card-icon-color] pt-3 ml-2"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {isOpen ? (
                            <MdArrowDropUp className="w-3 h-3 md:w-5 md:h-5 hover:scale-105" />
                        ) : (
                            <MdArrowDropDown className="w-3 h-3 md:w-5 md:h-5 hover:scale-105" />
                        )}
                    </button>
                </div>
            </div>
            <div className="flex md:hidden gap-2 text-[--site-card-icon-color] pt-8 px-10">
                <AiOutlineUser className="w-8 h-8" />
                <span className="text-2xl font-semibold">Tutors</span>
            </div>
            <div className="flex flex-col w-full px-5 pt-8 pb-16 md:gap-8 md:px-10">
                <div className={showDescription}>
                    <div className="flex w-full h-auto rounded-lg md:w-7/12">
                        <Carousel>
                            {[
                                { src: data1, type: "video/webm" },
                                { src: data2, type: "video/webm" },
                                { src: data3, type: "video/webm" },
                                { src: data4, type: "video/webm" },
                                { src: data5, type: "video/webm" },
                            ].map((videoData, index) => (
                                <div
                                    key={"video" + videoData.src}
                                    className="flex w-full h-full"
                                >
                                    <video
                                        className="object-cover w-full h-full"
                                        controls={false}
                                        onClick={() => togglePlay(index)}
                                        ref={(ref) =>
                                            (videosRef.current[index] = ref)
                                        }
                                    >
                                        <source
                                            src={videoData.src}
                                            type={videoData.type}
                                        />
                                    </video>

                                    <div className="absolute w-full translate-x-1/2 -translate-y-1/2 top-1/2">
                                        {isPlaying ? null : (
                                            <button
                                                className="bg-[--site-main-Table-Text] ml-[-22px] w-[44px] h-[44px] rounded-full flex items-center justify-center"
                                                onClick={() => {
                                                    togglePlay(index);
                                                }}
                                            >
                                                <BsFillPlayFill className="w-7 h-7" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </Carousel>
                    </div>
                    <div className="flex-col flex md:pr-[26px] md:pt-[71px] md:pb-[95px] md:gap-[30px] md:w-5/12">
                        <span className="text-3xl font-bold text-[--site-card-icon-color]">
                            How to build Your Tutor
                        </span>
                        <span className="text-[24px] leading-[40px] font-medium text-[--site-chat-video-description-color]">
                            Watch the video, Once you've finished watch the next
                            one for how to customize your Tutor.
                        </span>
                    </div>
                </div>
                {location.pathname === "/chatbot/chat" ? (
                    <div className="pt-8 md:pt-0">
                        <div className="w-full border-[--site-chat-header-border] border rounded-2xl from-[--site-chat-header-to-color] bg-gradient-to-br">
                            <ChatTable
                                chat={chat}
                                handleAdd={showModal}
                                handleDelete={getChats}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="pt-8">
                        <Outlet />
                    </div>
                )}

                <Chatmodal
                    open={isModalOpen}
                    handleOk={handleOk}
                    handleCancel={handleCancel}
                />
            </div>
        </div>
    );
};

export default Chat;
