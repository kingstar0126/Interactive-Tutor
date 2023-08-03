import { BsFillPlayFill } from "react-icons/bs";
import {
    AiOutlineUser,
    AiOutlineMenu,
    AiOutlineConsoleSql,
} from "react-icons/ai";
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
import { Scrollbar } from "react-scrollbars-custom";
import { Carousel, IconButton } from "@material-tailwind/react";
import { changeuser } from "../redux/actions/userAction";
import {
    Typography,
    Button,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
} from "@material-tailwind/react";

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
    const descroption = [
        {
            title: "Creating an account",
            content: `This tutorial provides a clear, step-by-step guide on setting up a new account with Interactive Tutor, an essential process for anyone looking to utilize this powerful educational tool. The guide begins at the homepage of interactive-tutor.com, instructing users to find and select the 'Start for Free' button located at the top right of the screen.

    ​
    
    In the following segment, we explain how to navigate the Sign-Up page. Here, we stress the importance of filling out all required information accurately, including your first and last name, a valid email address, and a secure password. We emphasize the significance of a strong password that uses a mix of numbers, letters, and special characters to enhance account security.
    
    ​
    
    The guide also highlights the need to re-enter your chosen password in the 'Confirm Password' field for verification purposes. An important step in this process is agreeing to the 'Terms of Service' and 'Privacy Policy'. To accept, users are directed to tick the checkbox after careful reading.
    
    ​
    
    We explain that once all fields are correctly filled out and terms and conditions are agreed upon, users should select 'Create Account' to finalize the setup process. The tutorial assures users that a successful account creation will prompt a confirmation message and an email verification step, advising users to check their inbox and follow the provided instructions.
    
     
    
    By successfully creating an account with Interactive Tutor, users gain the ability to start crafting their very own 'Interactive Tutor', absolutely free for a 14-day trial period. This tutorial is especially beneficial for educators, trainers, or individuals who seek an effective and interactive method to share and impart knowledge. After the trial, users can choose a subscription that fits their needs best.
    
    ​`,
        },
        {
            title: "Account Access",
            content: `This succinct tutorial illustrates how to log in and out of your Interactive Tutor account, a necessary process for utilizing the platform's educational tools and ensuring account security.

    ​
    
    First, it shows how to log in from the homepage, with a simple click on the 'Login' button and entering the appropriate credentials.
    
    ​
    
    The tutorial also offers guidance on how to reset a forgotten password, ensuring a smooth login process.
    
    ​
    
    Finally, it demonstrates how to log out, a step that promotes account security, especially on shared devices. By mastering these steps, users can safely and effectively use Interactive Tutor.`,
        },
        {
            title: "The Dashboard",
            content: `This quick guide introduces the Interactive Tutor's dashboard, the user-friendly hub for accessing its tools and features.

    ​
    
    Upon login, users land on the dashboard that displays subscription details, usage, and options to upgrade for increased benefits.
    
    ​
    
    The left toolbar provides quick access to key sections: 'Tutors' for an overview of created tutorials, 'Subscriptions' to adjust plans, 'Account' for user settings, and 'Reports' for usage analytics.
    
    ​
    
    The central console provides extensive resources for creating an interactive tutor, a topic covered in our subsequent tutorials.
    
    ​
    
    Users are encouraged to explore this intuitive platform and discover its potential.`,
        },
        {
            title: "Add a Tutor",
            content: `This brief video outlines the steps to create a new tutor in the Interactive Tutor platform. Click 'Add Tutor' located at the console's bottom right to open the Tutor Menu.

    ​
    
    First, assign a 'Label' (visible only to you) and 'Description' to the Tutor. The 'Models' section allows you to select an OpenAI Large Language Model to power your Tutor's interactions - options range from GPT 3.5 4k to GPT 4.
    
    ​
    
    Customize the initial interaction with users using the 'Conversation Starter.'
    
    'Advanced Settings' let you fine-tune your Tutor for the best results. 'Context Behaviour' controls how the Tutor uses uploaded training data. You can instruct the Tutor to solely rely on this data, combine it with its own reasoning, or operate like ChatGPT for the most natural interactions.
    
    ​
    
    'Behaviour Prompt' allows you to guide the Tutor's demeanor towards users, and 'Creativity Temperature' adjusts response specificity.
    
    ​
    
    Once settings are in place, click 'Confirm' to finalize your new tutor, which is now ready for training and styling.`,
        },
        {
            title: "Training Your Tutor",
            content: `Navigate to your Tutor and select 'Training Data.' Here you'll see a summary of data sources your Tutor has been trained on - it should currently be empty.

    ​
    
    By clicking 'Add Data,' you can start feeding content to your Tutor. For example, let's train our Yoda-themed tutor with the Wikipedia page on Jedi history. Label this data source and paste the webpage URL, then confirm. The engine will begin training your Tutor on this data.
    
    ​
    
    Upon completion, the data source appears in your dashboard. Remember, with a free trial, you can only add one data source per Tutor. Standard and Pro packages allow for three and ten data sources, respectively.
    
    To remove a data source, simply select 'Delete.'
    
    ​
    
    Adding a new data source follows the same process. Let's upload a whole book - 'The Jedi Path' by Daniel Wallace. The engine might take a bit longer this time. Once it's listed as 'trained' in the dashboard, you're done!
    
    ​
    
    You've now trained your Tutor, and it's ready for styling.`,
        },
        {
            title: "Styling Your Tutor",
            content: `In this tutorial we'll explore the customization options to style your Tutor.

    Navigate to the 'Branding' tab in the Tutor. Here, you'll find a variety of features for personalization.
    
    ​
    
    First, set the 'Title' and 'Description' - these will be publicly visible. For example, our Tutor, named ‘Learn from Yoda,’ has the description, “Ask Yoda questions on how to become a Jedi”.
    
    ​
    
    If you're on the Standard or Pro subscription, you can add a 'Copyright' or disclaimer and remove the ‘Powered by Interactive Tutor’ text.
    
    ​
    
    If you plan to embed your Tutor as a chatbot, you can set up the color scheme and notifications.
    
    ​
    
    For branding, you can upload a 'Logo' for your Tutor and customize its size. 'User Avatar' and 'AI Avatar' can be added to represent learners and your Tutor, respectively. In our example, a cartoon of Luke Skywalker and Yoda serve these roles.
    
    ​
    
    Below, you can select colors for both the Tutor and User communication boxes, including background and text color.
    
    ​
    
    Lastly, 'Call to action' buttons can link to external resources. In our case, it redirects to the previously uploaded Wikipedia page.
    
    ​
    
    After customization, preview your new Tutor. Isn't it cool?
    
    ​`,
        },
        {
            title: "Sharing Your Tutor",
            content: `Once your Tutor is ready, there are several ways to distribute it. From embedding it on your site or intranet, to sharing via an Organization ID and Pin Code for access on the Interactive Tutor mobile app.

    ​
    
    But before sharing, it's a good idea to test your Tutor and verify the branding and responses. Use the preview window for this.
    
    ​
    
    When you're ready to share, you have a few options:
    
    ​
    
    Embed the Tutor on your site: Open the embed menu and choose to embed your Tutor as an iFrame (a window on your page) or as a chatbot.
    
    Share via a unique login page: Share the URL of the login page where users can access the Tutor by entering your unique Organization ID and the Tutor Pin Code.
    
    Share for mobile access: Users can download the Interactive Tutor app from their app store and access your Tutor by entering the same Organization ID and Pin Code.
    
    ​
    
    Interactive Tutor allows you to control who has access to your content, safeguarding your intellectual property.`,
        },
    ];
    const videos = [
        {
            src: "http://192.168.103.63:3000/video1.webm",
            type: "video/webm",
        },
        {
            src: "http://192.168.103.63:3000/video2.webm",
            type: "video/webm",
        },
        {
            src: "http://192.168.103.63:3000/video3.webm",
            type: "video/webm",
        },
        {
            src: "http://192.168.103.63:3000/video4.webm",
            type: "video/webm",
        },
        {
            src: "http://192.168.103.63:3000/video5.webm",
            type: "video/webm",
        },
        {
            src: "http://192.168.103.63:3000/video6.webm",
            type: "video/webm",
        },
        {
            src: "http://192.168.103.63:3000/video7.webm",
            type: "video/webm",
        },
    ];
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
            setOpen(true);
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
                        onClick={() => navigate("/chatbot/subscription")}
                        className="flex p-2 rounded bg-[--site-logo-text-color] text-[--site-card-icon-color] ml-2"
                    >
                        <MdOutlineUpdate className="w-4 h-4 md:w-6 md:h-6" />
                        <span className="md:text-base text-[12px] font-medium">
                            Upgrade
                        </span>
                    </button>

                    <button
                        className="p-2 flex justify-center items-center bg-[--site-logo-text-color] rounded text-[--site-card-icon-color] pt-3 ml-2 opacity-100"
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
                                        className="object-cover w-full h-full"
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
                                        handlePrev();
                                    }}
                                    className="!absolute top-2/4 left-4 -translate-y-2/4 text-[--site-card-icon-color]"
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
                                        handleNext();
                                    }}
                                    className="!absolute top-2/4 !right-4 -translate-y-2/4 text-[--site-card-icon-color]"
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
                                        className="flex flex-col"
                                        key={description.title + index}
                                    >
                                        <span className="text-[16px] font-medium text-[--site-card-icon-color]">
                                            {description.title}
                                        </span>
                                        <span className="text-[14px] leading-[40px] font-medium text-[--site-chat-video-description-color] h-[20rem]">
                                            <Scrollbar>
                                                {description.content}
                                            </Scrollbar>
                                        </span>
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
                                changeuser(dispatch, null);
                                navigate("/login");
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
