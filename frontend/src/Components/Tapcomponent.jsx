import { useEffect, useState } from "react";
import {
    Tabs,
    TabsHeader,
    TabsBody,
    Tab,
    TabPanel,
} from "@material-tailwind/react";
import NewChat from "./NewChat";
import Branding from "./Branding";
import TraindataTable from "./TrainData";
import History from "./History";
import { AiFillFolderOpen } from "react-icons/ai";
import { SiHiveBlockchain } from "react-icons/si";
import { MdUpdate } from "react-icons/md";
import { useSelector } from "react-redux";
import Embedded from "./Embedded";
import axios from "axios";
import { webAPI } from "../utils/constants";
import toast, { Toaster } from "react-hot-toast";
import Chatmodal from "./Chatmodal";
import { setchatbot, getchat } from "../redux/actions/chatAction";
import { useDispatch } from "react-redux";

export default function Example() {
    const chat = JSON.parse(useSelector((state) => state.chat.chat));
    const [activeTab, setActiveTab] = useState("preview");
    const dispatch = useDispatch();
    const [message_history, setMessage_history] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [updateModalOpen, setUpdateModalOpen] = useState(false);

    const notification = (type, message) => {
        // To do in here
        if (type === "error") {
            toast.error(message);
        }
        if (type === "success") {
            toast.success(message);
        }
    };
    const showUpdateModal = () => {
        setUpdateModalOpen(true);
    };
    const handleUpdateOk = (data) => {
        axios.post(webAPI.updatechat, data).then((res) => {
            if (!res.data.success) {
                notification("error", res.data.message);
            } else {
                notification("success", res.data.message);
                getchat(dispatch, data);
                axios
                .get("https://geolocation-db.com/json/")
                .then((res) => {
                    let country = res.data.country_name;
                    data["country"] = country;
                    setchatbot(dispatch, data);
                })
                
            }
        });
        setUpdateModalOpen(false);
    };

    const handleOpen = (e) => {
        window.open(`/chat/embedding/${chat.uuid}`, "_blank");
    };
    const handleEmbedding = (e) => {
        showModal();
    };
    const handleUpdate = (e) => {
        showUpdateModal();
    };

    const showModal = () => {
        setIsModalOpen(true);
    };
    const handleOk = (data) => {
        setIsModalOpen(false);
    };
    const handleCancel = () => {
        setIsModalOpen(false);
        setUpdateModalOpen(false);
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

    useEffect(() => {
        if (activeTab === "conversation Explorer") {
            getMessage_history();
        }
    }, [activeTab]);
    const data = [
        {
            label: "Preview",
            value: "preview",
            desc: (
                <div className="w-full h-full rounded-xl border-[--site-chat-header-border] border flex-col flex from-[--site-main-modal-from-color] bg-gradient-to-br">
                    <Toaster />
                    <div className="flex flex-col p-5 md:w-full md:z-0">
                        <div className="flex flex-col justify-between gap-5 text-black md:flex-row md:gap-0">
                            <div className="flex flex-col gap-5 md:flex-row">
                                <button
                                    onClick={handleOpen}
                                    className="bg-[--site-logo-text-color] p-2 rounded-sm flex items-center justify-center gap-2"
                                >
                                    <AiFillFolderOpen />
                                    Open Chat
                                </button>
                                <button
                                    onClick={handleEmbedding}
                                    className="bg-[--site-logo-text-color] p-2 rounded-sm flex items-center justify-center gap-2"
                                >
                                    <SiHiveBlockchain />
                                    Embedded Chat
                                </button>
                            </div>
                            <button
                                className="bg-[--site-logo-text-color] p-2 rounded-sm flex items-center justify-center gap-2"
                                onClick={handleUpdate}
                            >
                                <MdUpdate className="w-6 h-6" />
                                Update Chat
                            </button>
                        </div>
                    </div>
                    <div className="h-hull min-h-[430px] flex">
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
                        handleOk={handleUpdateOk}
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
                <div className="border-[--site-chat-header-border] border rounded-xl from-[--site-main-modal-from-color] bg-gradient-to-br">
                    <TraindataTable />
                </div>
            ),
        },
        {
            label: "Conversation Explorer",
            value: "conversation Explorer",
            desc: (
                <div className="border-[--site-chat-header-border] border rounded-xl from-[--site-main-modal-from-color] bg-gradient-to-br">
                    <History data={message_history} />
                </div>
            ),
        },
    ];
    return (
        <Tabs value={activeTab} id="custom-animation">
            <TabsHeader
                className="md:px-6 md:py-4 bg-transparent border-b rounded-none border-[--site-chat-header-border] flex xl:flex-row flex-col gap-2 xl:gap-0"
                indicatorProps={{
                    className:
                        "bg-[--site-card-icon-color] shadow-none text-white py-3 px-20",
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
                                ? "text-white w-full flex justify-center"
                                : "flex justify-center xl:border-none border w-full border-black rounded-md"
                        }
                    >
                        {label}
                    </Tab>
                ))}
            </TabsHeader>
            <TabsBody
                animate={{
                    initial: { y: 250 },
                    mount: { y: 0 },
                    unmount: { y: 250 },
                }}
                className="mt-6"
            >
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
    );
}
