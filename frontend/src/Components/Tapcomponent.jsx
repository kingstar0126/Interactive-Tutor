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
    const [messagehistory, setMeessagehistory] = useState([]);
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
            if (!res.data.success) notification("error", res.data.message);
            else {
                notification("success", res.data.message);
                getchat(dispatch, data);
                setchatbot(dispatch, data);
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
    const getMessageHistory = () => {
        axios
            .post(webAPI.get_messages, { id: chat.id })
            .then((res) => {
                console.log(res);
                var messages = [];
                res.data.data.map(
                    (item) => item.message.length > 0 && messages.push(item)
                );
                setMeessagehistory(messages);
            })
            .catch((err) => console.error(err));
    };

    useEffect(() => {
        if (activeTab === "conversation Explorer") {
            getMessageHistory();
        }
    }, [activeTab]);
    const data = [
        {
            label: "Preview",
            value: "preview",
            desc: (
                <div className="w-full h-full">
                    <Toaster />
                    <div className="flex justify-between">
                        <div className="gap-5 flex">
                            <button
                                onClick={handleOpen}
                                className="bg-[--site-logo-text-color] p-2 rounded-xl flex items-center justify-center gap-2"
                            >
                                <AiFillFolderOpen />
                                Open Chat
                            </button>
                            <button
                                onClick={handleEmbedding}
                                className="bg-[--site-logo-text-color] p-2 rounded-xl flex items-center justify-center gap-2"
                            >
                                <SiHiveBlockchain />
                                Embedded Chat
                            </button>
                        </div>
                        <button
                            className="bg-[--site-logo-text-color] p-2 rounded-xl flex items-center justify-center gap-2"
                            onClick={handleUpdate}
                        >
                            <MdUpdate />
                            Update Chat
                        </button>
                    </div>
                    <NewChat />
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
            desc: <Branding />,
        },
        {
            label: "Training Data",
            value: "training Data",
            desc: <TraindataTable />,
        },
        {
            label: "Conversation Explorer",
            value: "conversation Explorer",
            desc: <History data={messagehistory} />,
        },
    ];
    return (
        <Tabs value={activeTab} id="custom-animation">
            <TabsHeader
                className="p-2"
                indicatorProps={{
                    className:
                        "bg-transparent border-b-[3px] pb-0 border-[--site-card-icon-color] shadow-none rounded-none",
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
                                ? "text-[--site-card-icon-color] pb-0 font-bold"
                                : ""
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
            >
                {data.map(({ value, desc }) => (
                    <TabPanel
                        key={value}
                        value={value}
                        className="flex justify-center bg-[--site-card-icon-color] rounded-xl min-h-[800px]"
                    >
                        {desc}
                    </TabPanel>
                ))}
            </TabsBody>
        </Tabs>
    );
}
