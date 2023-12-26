import { useEffect, useState } from "react";
import {
    Tabs,
    TabsHeader,
    TabsBody,
    Tab,
    TabPanel,
    Button,
} from "@material-tailwind/react";
import NewChat from "./NewChat";
import Branding from "./Branding";
import TraindataTable from "./TrainData";
import History from "./History";
import { AiFillFolderOpen, AiOutlineReload } from "react-icons/ai";
import { SiHiveBlockchain } from "react-icons/si";
import { useDispatch, useSelector } from "react-redux";
import Embedded from "./Embedded";
import axios from "axios";
import { webAPI } from "../utils/constants";
import toast, { Toaster } from "react-hot-toast";
import { MdUpdate } from "react-icons/md";
import { useLocation } from "react-router-dom";
import Chatmodal from "./Chatmodal";
import { updatechatbot } from "../redux/actions/chatAction";

export default function Example() {
    const chatState = useSelector((state) => state.chat.chat);
    const chat = (chatState && JSON.parse(chatState)) || {};
    const [activeTab, setActiveTab] = useState("preview");
    const [message_history, setMessage_history] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [updateModalOpen, setUpdateModalOpen] = useState(false);
    const [newChatKey, setNewChatKey] = useState(0);
    let location = useLocation();
    const dispatch = useDispatch();

    const handleOpen = (e) => {
        window.open(`/chat/embedding/${chat.uuid}`, "_blank");
    };
    const handleEmbedding = (e) => {
        showModal();
    };

    const showModal = () => {
        setIsModalOpen(true);
    };
    const handleOk = (data) => {
        setIsModalOpen(false);
    };
    const handleCancel = () => {
        setUpdateModalOpen(false);
        setIsModalOpen(false);
    };
    const getMessage_history = () => {
        axios
            .post(webAPI.get_messages, { id: chat.id })
            .then((res) => {
                let messages = [];
                res.data.data.map(
                    (item) => item.message.length > 0 && messages.push(item)
                );
                setMessage_history(messages);
            })
            .catch((err) => console.error(err));
    };

    const handleNewChat = () => {
        setNewChatKey((prevKey) => prevKey + 1);
    };

    useEffect(() => {
        if (activeTab === "conversation Explorer") {
            getMessage_history();
        }
    }, [activeTab]);

    useEffect(() => {
    setNewChatKey((prevKey) => prevKey + 1);
    }, [location.pathname]);

    const handleUpdate = (e) => {
        setUpdateModalOpen(true);
    };

    const handleUpdateOk = (data) => {
        axios.post(webAPI.updatechat, data).then((res) => {
            if (res.data.success) {
                updatechatbot(dispatch, true);
            }
        });
        setUpdateModalOpen(false);
    };

    const data = [
        {
            label: "Preview",
            value: "preview",
            desc: (
                <div className="w-full rounded-xl border-[--site-chat-header-border] border flex-col">
                    <Toaster className="z-30" />
                    <div className="flex flex-col p-5 md:w-full md:z-0">
                        <div className="flex flex-col justify-between gap-5 text-black md:flex-row md:gap-0">
                            <div className="flex flex-col gap-5 md:flex-row">
                                <Button
                                    onClick={handleNewChat}
                                    variant="outlined"
                                    className="normal-case bg-white border border-[--site-onboarding-primary-color] py-2 px-4 rounded-md flex items-center justify-center gap-2 text-black text-base"
                                >
                                    <AiOutlineReload />
                                    New Chat
                                </Button>
                                <Button
                                    onClick={handleOpen}
                                    variant="outlined"
                                    className="normal-case bg-white py-2 px-4 border border-[--site-onboarding-primary-color] rounded-md flex items-center justify-center gap-2 text-black text-base"
                                >
                                    <AiFillFolderOpen />
                                    Open
                                </Button>
                                <Button
                                    onClick={handleEmbedding}
                                    variant="outlined"
                                    className="normal-case bg-white py-2 px-4 border border-[--site-onboarding-primary-color] rounded-md flex items-center justify-center gap-2 text-black text-base"
                                >
                                    <SiHiveBlockchain />
                                    Embed or Share
                                </Button>
                                <Button
                                    variant="outlined"
                                    className="normal-case bg-white py-2 px-4 border border-[--site-onboarding-primary-color] rounded-md flex items-center justify-center gap-2 text-black text-base"
                                    onClick={handleUpdate}
                                >
                                    <MdUpdate className="w-6 h-6" />
                                    Update
                                </Button>
                            </div>
                        </div>
                    </div>
                    <div className="h-hull min-h-[430px]">
                        <NewChat />
                    </div>
                    <Embedded
                        data={chat}
                        open={isModalOpen}
                        handleOk={handleOk}
                        handleCancel={handleCancel}
                    />
                    <Chatmodal
                        chat={chat}
                        open={updateModalOpen}
                        handleUpdate={handleUpdateOk}
                        handleCancel={handleCancel}
                    />
                </div>
            ),
        },
        {
            label: "Branding",
            value: "branding",
            desc: (
                <div className="bg-transparent">
                    <Branding />
                </div>
            ),
        },
        {
            label: "Training Data",
            value: "training Data",
            desc: (
                <div className="border-[--site-chat-header-border] border rounded-xl">
                    <TraindataTable data={chat} />
                </div>
            ),
        },
        {
            label: "Conversation Explorer",
            value: "conversation Explorer",
            desc: (
                <div className="border-[--site-chat-header-border] border rounded-xl">
                    <History data={message_history} />
                </div>
            ),
        },
    ];
    return (
        <div className="py-4 px-8 w-full">
            <Tabs value={activeTab} key={newChatKey}>
                <TabsHeader
                    className="md:px-6 md:py-4 bg-transparent border-b rounded-none border-[--site-chat-header-border] flex xl:flex-row flex-col gap-2 xl:gap-0"
                    indicatorProps={{
                        className:
                            "bg-[--site-onboarding-primary-color] shadow-none text-white py-3 px-20",
                    }}
                >
                    {data.map(({ label, value }) => (
                        <Tab
                            key={value}
                            value={value}
                            onClick={() => {
                                setActiveTab(value);
                            }}
                            className={
                                activeTab === value
                                    ? "text-white w-full flex justify-center z-0"
                                    : "flex justify-center xl:border-none border z-0 w-full border-black rounded-md"
                            }
                        >
                            {label}
                        </Tab>
                    ))}
                </TabsHeader>
                <TabsBody className="mt-6 h-full flex justify-center">
                    {data.map(({ value, desc }) => (
                        <TabPanel
                            key={value}
                            value={value}
                            className="p-0 rounded-2xl"
                        >
                            {desc}
                        </TabPanel>
                    ))}
                </TabsBody>
            </Tabs>
        </div>
    );
}
