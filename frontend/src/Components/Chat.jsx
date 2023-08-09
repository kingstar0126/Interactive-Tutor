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
import { Carousel, IconButton } from "@material-tailwind/react";
import {
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
} from "@material-tailwind/react";
import SubscriptionModal from "./SubscriptionModal";

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
    const [open, setOpen] = useState(false);
    const [isopenModal, setIsOpenModal] = useState(false);
    const descroption = [
        {
            title: "Welcome to Interactive Tutor",
            content: `Congratulations on registering your account, you are moments away from creating interactive tutors for your content. This collapsible dashboard is where you can find video lessons on how to get the most out of Interactive Tutor.`,
        },
        {
            title: "Add Your Tutor",
            content: `This brief video outlines the steps to create a new tutor in the Interactive Tutor platform. Click 'Add Tutor' located at the console's bottom right to open the Tutor Menu. You will then have the options you need to setup your Tutor.`,
        },
        {
            title: "Training Your Tutor",
            content: `By clicking 'Add Data,' you can start feeding content to your Tutor. For example, let's train our Yoda-themed tutor with the Wikipedia page on Jedi history. Label this data source and paste the webpage URL, then confirm. The engine will begin training your Tutor on this data.`,
        },
        {
            title: "Styling Your Tutor",
            content: `In this tutorial we'll explore the customisation options to style your Tutor. Navigate to the 'Branding' tab in the Tutor. Here, you'll find a variety of features for personalisation. You can change the logos, avatars, colours and font sizes. You can also add buttons to link your Interactive Tutor to other websites or pages.`,
        },
        {
            title: "Sharing Your Tutor",
            content: `Once your Interactive Tutor is ready, there are several ways for you to make it available. From embedding it on your site or intranet, to sharing via an Organization ID and Pin Code for access on the Interactive Tutor mobile app.`,
        },
    ];
    const videos = [
        {
            src: "https://video.wixstatic.com/video/4d69d5_460d6c1987694c569ea62b7f32b51bf1/1080p/mp4/file.mp4",
            type: "video/mp4",
        },
        {
            src: "https://video.wixstatic.com/video/4d69d5_ca127d9db93c4475bb3cf55781f88b70/720p/mp4/file.mp4",
            type: "video/mp4",
        },
        {
            src: "https://video.wixstatic.com/video/4d69d5_8e22f27eb45946fc9269ab9dafedc7da/720p/mp4/file.mp4",
            type: "video/mp4",
        },
        {
            src: "https://video.wixstatic.com/video/4d69d5_7ac0914dc4d9438ca13eb2c087f0115c/720p/mp4/file.mp4",
            type: "video/mp4",
        },
        {
            src: "https://video.wixstatic.com/video/4d69d5_9659672cc61c45d0b0c6606356b2b83b/720p/mp4/file.mp4",
            type: "video/mp4",
        },
    ];
    const handleOpenModel = () => {
        setIsOpenModal(!isopenModal);
    };
    const [isactiveIndex, setIsActiveIndex] = useState(0);
    const videoRef = useRef([]);
    const togglePlay = () => {
        const video = videoRef.current[isactiveIndex];

        if (video.paused) {
            video.play();
        } else {
            video.pause();
        }

        setIsPlaying(!video.paused);
    };

    const [showDescription, setShowDescription] = useState("block");
    const dispatch = useDispatch();
    const handleOpenSidebar = () => {
        dispatch(setOpenSidebar());
    };
    const showModal = () => {
        setIsModalOpen(true);
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
        getChats();
        setIsModalOpen(false);
    };

    const handleTransfer = (message) => {
        notification("success", message);
        getChats();
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

    const pauseVideo = (index) => {
        const video = videoRef.current[index];
        if (!video.paused) {
            video.pause();
        }

        setIsPlaying(!video.paused);
    };
    useEffect(() => {
        getUserState(dispatch, { id: user.id });
        setquery(dispatch, user.query);
        if (user.role === 5) {
            setTrial(user.days);
            getChats();
        } else if (user.role === undefined || user.role === 0) {
            setOpen(true);
        } else {
            getChats();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const getChats = () => {
        let data = {
            user_id: user.id,
        };

        axios.post(webAPI.getchats, data).then((res) => {
            SetChat(res.data.data);
        });
    };

    return (
        <div>
            <Toaster />
            <div className="flex md:items-center items-end justify-between w-full md:h-[100px] md:px-10 from-[--site-chat-header-from-color] to-[--site-chat-header-to-color] md:border-b-[--site-chat-header-border] md:border bg-gradient-to-r px-4 py-2 max-h-min gap-1">
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
                        <div className="flex items-end justify-end md:w-max scale-75 md:scale-100 ml-[-14px] mr-[-20px] translate-y-2 md:translate-y-0">
                            <ReactSpeedometer
                                maxSegmentLabels={0}
                                segments={4}
                                width={100}
                                height={58}
                                ringWidth={10}
                                value={24 - trial}
                                needleColor="black"
                                needleHeightRatio={0.5}
                                maxValue={24}
                                startColor={"#f5da42"}
                                endColor={"#ff0000"}
                            />
                        </div>
                    )}
                    <button
                        onClick={handleOpenModel}
                        className="flex p-2 rounded bg-[--site-logo-text-color] text-[--site-card-icon-color] ml-2"
                    >
                        <MdOutlineUpdate className="w-4 h-4 md:w-6 md:h-6" />
                        <span className="md:text-base text-[12px] font-medium">
                            Upgrade
                        </span>
                    </button>

                    <button
                        className="p-2 flex justify-center items-center bg-[--site-card-icon-color] rounded text-[--site-logo-text-color] pt-3 ml-2 opacity-100"
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
                        {videos.map((videoData, index) => {
                            const className =
                                index === isactiveIndex
                                    ? "relative w-full h-full"
                                    : "hidden w-full h-full";
                            return (
                                <div
                                    key={"video" + videoData.src}
                                    className={className}
                                >
                                    <video
                                        className="object-cover rounded-xl w-full h-full"
                                        controls={false}
                                        onClick={() => togglePlay()}
                                        ref={(ref) =>
                                            (videoRef.current[index] = ref)
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
                                                    togglePlay();
                                                }}
                                            >
                                                <BsFillPlayFill className="w-7 h-7" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex flex-col md:w-5/12">
                        <Carousel
                            navigation={({
                                setActiveIndex,
                                activeIndex,
                                length,
                            }) => (
                                <div className="absolute z-50 flex gap-2 bottom-4 left-2/4 -translate-x-2/4">
                                    {setIsActiveIndex(activeIndex)}
                                    {new Array(length).fill("").map((_, i) => (
                                        <span
                                            key={i}
                                            className={`block h-1 cursor-pointer rounded-2xl transition-all content-[''] ${
                                                activeIndex === i
                                                    ? "w-8 bg-[--site-card-icon-color]"
                                                    : "w-4 bg-[--site-card-icon-color] opacity-50"
                                            }`}
                                            onClick={() => {
                                                setActiveIndex(i);
                                            }}
                                        />
                                    ))}
                                </div>
                            )}
                            prevArrow={({ handlePrev, activeIndex }) => (
                                <IconButton
                                    variant="text"
                                    size="lg"
                                    onClick={() => {
                                        {
                                            pauseVideo(activeIndex);
                                        }
                                        handlePrev();
                                    }}
                                    className="!absolute top-3/4 left-4 -translate-y-2/4 text-[--site-card-icon-color]"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={2}
                                        stroke="currentColor"
                                        className="w-6 h-6"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                                        />
                                    </svg>
                                </IconButton>
                            )}
                            nextArrow={({ handleNext, activeIndex }) => (
                                <IconButton
                                    variant="text"
                                    size="lg"
                                    onClick={() => {
                                        {
                                            pauseVideo(activeIndex);
                                        }
                                        handleNext();
                                    }}
                                    className="!absolute top-3/4 !right-4 -translate-y-2/4 text-[--site-card-icon-color]"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="green"
                                        viewBox="0 0 24 24"
                                        strokeWidth={2}
                                        stroke="currentColor"
                                        className="w-6 h-6"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                                        />
                                    </svg>
                                </IconButton>
                            )}
                        >
                            {descroption.map((description, index) => {
                                return (
                                    <div
                                        className="flex h-full items-center"
                                        key={description.title + index}
                                    >
                                        <div className="flex flex-col w-full items-center text-center justify center">
                                            <span className="text-[16px] font-semibold text-[--site-card-icon-color]">
                                                {description.title}
                                            </span>
                                            <span className="text-[14px] leading-[40px] font-medium text-[--site-chat-video-description-color] ">
                                                {description.content}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </Carousel>
                    </div>
                </div>
                {location.pathname === "/chatbot/chat" ? (
                    <div className="pt-8 md:pt-0">
                        <div className="w-full border-[--site-chat-header-border] border rounded-2xl from-[--site-chat-header-to-color] bg-gradient-to-br">
                            <ChatTable
                                chat={chat}
                                handleAdd={showModal}
                                handleDelete={getChats}
                                handleTransfer={handleTransfer}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="pt-8">
                        <Outlet />
                    </div>
                )}
                <Dialog
                    open={open}
                    className="border-[--site-chat-header-border] border rounded-2xl from-[--site-main-modal-from-color] to-[--site-main-modal-to-color] bg-gradient-to-br shadow-lg shadow-[--site-card-icon-color]"
                >
                    <DialogHeader>Important</DialogHeader>
                    <DialogBody divider>
                        <span className="text-base text-black">
                            Your trial has expired, please choose your
                            subscription to continue using interactive tutor.
                        </span>
                    </DialogBody>
                    <DialogFooter className="flex items-center justify-end gap-4 pb-8">
                        <button
                            onClick={() => {
                                window.localStorage.clear();
                                window.location.replace(
                                    window.location.origin + "/login"
                                );
                                setOpen(false);
                            }}
                            className="bg-transparent border-[--site-card-icon-color] text-[--site-card-icon-color] text-base font-semibold border rounded-md px-4 py-2"
                        >
                            logout
                        </button>

                        <button
                            onClick={() => {
                                navigate("/chatbot/subscription");
                                setOpen(false);
                            }}
                            className="px-4 py-2 text-base font-semibold text-white bg-[--site-card-icon-color] rounded-md"
                        >
                            subscribe
                        </button>
                    </DialogFooter>
                </Dialog>
                <SubscriptionModal
                    open={isopenModal}
                    handleCancel={() => handleOpenModel()}
                />
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
