import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { webAPI } from "../utils/constants";
import Chatmodal from "./Chatmodal";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { getchat } from "../redux/actions/chatAction";
import { useNavigate } from "react-router-dom";
import { AiOutlinePlus } from "react-icons/ai";
import { useSelector } from "react-redux";
import {
    Typography,
    Button,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
} from "@material-tailwind/react";
import React from "react";

const ChatTable = (props) => {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const dispatch = useDispatch();
    const [currentchat, SetCurrentchat] = useState({});
    const [email, setEmail] = useState("");
    const [tableData, setTableData] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [chatData, setChatData] = useState([]);
    const itemsPerPage = 5;
    const [open, setOpen] = useState(false);
    const [isTransModal, setIsTrnasModal] = useState(false);
    const user = JSON.parse(useSelector((state) => state.user.user));
    const [id, setId] = useState(0);
    const TABLE_HEAD = [
        { label: "1", value: "Label" },
        { label: "2", value: "Pin" },
        { label: "3", value: "Welcome message" },
        { label: "4", value: "Behaviour prompt" },
        { label: "5", value: "" },
    ];

    const showModal = () => {
        setIsModalOpen(true);
    };

    useEffect(() => {
        if (props.chat) {
            setChatData(props.chat);
            setCurrentPage(1);
        }
    }, [props.chat]);

    const getTotalPages = () => {
        return Math.ceil(chatData.length / itemsPerPage);
    };

    const getPaginationRange = () => {
        const lastIndex = currentPage * itemsPerPage;
        const firstIndex = lastIndex - itemsPerPage;
        return {
            firstIndex,
            lastIndex,
        };
    };

    useEffect(() => {
        setTableData(getCurrentPageData);
    }, [chatData, currentPage]);

    const getCurrentPageData = () => {
        const { firstIndex, lastIndex } = getPaginationRange();
        return props.chat.slice(firstIndex, lastIndex);
    };

    const handleOk = (data) => {
        axios.post(webAPI.updatechat, data).then((res) => {
            if (!res.data.success) {
                notification("error", res.data.message);
            } else {
                notification("success", res.data.message);
            }
        });
        setIsModalOpen(false);
    };
    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const GetCurrentchat = (data) => {
        getchat(dispatch, data);
        navigate("newchat");
    };
    const notification = (type, message) => {
        // To do in here
        if (type === "error") {
            toast.error(message);
        }
        if (type === "success") {
            toast.success(message);
        }
    };

    const handleOpen = () => setOpen(!open);
    const handleOpenTransModal = () => setIsTrnasModal(!isTransModal);

    return (
        <div className="relative overflow-x-auto rounded-xl">
            <Toaster />
            <div className="flex xl:hidden justify-end pt-3 px-2">
                <Button
                    className="normal-case px-4 py-2 rounded-md gap-1 text-sm inline-flex items-center justify-center bg-[--site-card-icon-color] w-1/2 text-[--site-main-Table-Text]"
                    onClick={() => {
                        props.handleAdd();
                    }}
                >
                    Add AI Tutors
                    <AiOutlinePlus className="w-4 h-4" />
                </Button>
            </div>
            <table className="w-full table-fixed text-start">
                <thead>
                    <tr className="w-full border-b border-[--site-main-Table-border-color]">
                        {TABLE_HEAD.map((head) => {
                            const classes =
                                head.label === "1"
                                    ? "xl:w-2/12 w-1/2 text-start pt-10 pb-5 pl-8"
                                    : head.label === "2"
                                    ? "xl:w-1/12 text-start xl:table-cell hidden pt-10 pb-5 pl-8"
                                    : head.label === "5"
                                    ? "text-start  pt-10 pb-5 pl-8 pr-8"
                                    : "xl:w-3/12 text-start xl:table-cell hidden pt-10 pb-5 pl-8";
                            return (
                                <React.Fragment key={head.label}>
                                    {head.label !== "5" ? (
                                        <th className={classes}>
                                            <Typography
                                                variant="small"
                                                className="text-base font-medium text-[--site-card-icon-color]"
                                            >
                                                {head.value}
                                            </Typography>
                                        </th>
                                    ) : (
                                        <th className={classes}>
                                            <Button
                                                className="normal-case px-4 py-2 rounded-md gap-1 hidden xl:inline-flex items-center justify-center bg-[--site-card-icon-color] w-full text-[--site-main-Table-Text]"
                                                onClick={() => {
                                                    props.handleAdd();
                                                }}
                                            >
                                                <span className="text-xl">
                                                    Add AI Tutors
                                                </span>
                                                <AiOutlinePlus className="w-6 h-6" />
                                            </Button>
                                            <Typography
                                                variant="small"
                                                className="text-base xl:hidden font-medium text-[--site-card-icon-color] text-start"
                                            >
                                                Action
                                            </Typography>
                                        </th>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </tr>
                </thead>
                <tbody>
                    {tableData.map((data) => {
                        return (
                            <tr
                                key={data["label"]}
                                className="w-full border-b border-[--site-main-Table-border-color]"
                            >
                                <td className="w-1/2 xl:w-2/12 py-5 pl-8 text-start">
                                    <Typography
                                        variant="small"
                                        color="blue-gray"
                                        className="font-normal"
                                    >
                                        {data["label"]}
                                    </Typography>
                                </td>
                                <td className="xl:w-1/12 hidden xl:table-cell py-5 pl-8 text-start">
                                    <Typography
                                        variant="small"
                                        color="blue-gray"
                                        className="font-normal"
                                    >
                                        {data["access"]}
                                    </Typography>
                                </td>
                                <td className="xl:w-3/12 py-5 hidden xl:table-cell pl-8 text-start">
                                    <Typography
                                        variant="small"
                                        color="blue-gray"
                                        className="font-normal"
                                    >
                                        {data["conversation"]}
                                    </Typography>
                                </td>
                                <td className="xl:w-3/12 py-5 pl-8 hidden xl:table-cell text-start">
                                    <Typography
                                        variant="small"
                                        color="blue-gray"
                                        className="font-normal truncate"
                                    >
                                        {data["behavior"]}
                                    </Typography>
                                </td>
                                <td className="xl:py-5 xl:pl-8 xl:pr-8 text-start pr-4">
                                    <div className="flex w-full h-full gap-2 justify-center">
                                        <button
                                            className="w-full h-full xl:p-2 px-1 bg-[#479200]/25 rounded-md text-[#479200] hover:bg-[#479200]/75 hover:text-white transition-color duration-150 ease-out active:bg-white active:ring active:ring-[#479200] active:text-[#479200]"
                                            onClick={() => GetCurrentchat(data)}
                                        >
                                            <span className="xl:text-base text-sm font-medium">
                                                Open
                                            </span>
                                        </button>
                                        { data['inviteId'] === null ? (
                                            <>
                                                <button
                                                    className="w-full h-full xl:p-2 px-1 bg-[#153144]/25 rounded-md text-[#153144] hover:bg-[#153144]/75 hover:text-white transition-color duration-150 ease-out active:bg-white active:ring active:ring-[#153144] active:text-[#153144]"
                                                    onClick={() => {
                                                        SetCurrentchat(data);
                                                        showModal();
                                                    }}
                                                >
                                                    <span className="xl:text-base text-sm font-medium">Edit</span>
                                                </button>
                                                {user.role === 1 && (
                                                    <button
                                                        className="w-full h-full xl:p-2 px-1 bg-[#5f3f4f]/25 rounded-md text-[#5f3f4f] hover:bg-[#5f3f4f]/75 hover:text-white transition-color duration-150 ease-out active:bg-white active:ring active:ring-[#5f3f4f] active:text-[#5f3f4f]"
                                                        onClick={() => {
                                                            handleOpenTransModal();
                                                            setId(data["id"]);
                                                        }}
                                                    >
                                                        <span className="xl:text-base text-sm font-medium">
                                                            Transfer
                                                        </span>
                                                    </button>
                                                )}

                                                <button
                                                    className="w-full h-full xl:p-2 px-1 bg-[#FF2121]/25 rounded-md text-[#FF2121] hover:bg-[#FF2121]/75 hover:text-white transition-color duration-150 ease-out active:bg-white active:ring active:ring-[#FF2121] active:text-[#FF2121]"
                                                    onClick={() => {
                                                        handleOpen();
                                                        setId(data["id"]);
                                                    }}
                                                >
                                                    <span className="xl:text-base text-sm font-medium">
                                                        Delete
                                                    </span>
                                                </button>
                                            </>
                                        ) : null }
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            {chatData.length > 5 && (
                <div className="flex justify-between border-t border-[--site-main-modal-input-border-color] p-5">
                    <Typography
                        variant="small"
                        color="black"
                        className="font-normal"
                    >
                        Page {currentPage} of {getTotalPages()}
                    </Typography>
                    <div className="flex gap-2">
                        <Button
                            variant="outlined"
                            color="blue-gray"
                            size="sm"
                            onClick={() =>
                                setCurrentPage(
                                    currentPage > 1
                                        ? currentPage - 1
                                        : currentPage
                                )
                            }
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outlined"
                            color="blue-gray"
                            size="sm"
                            onClick={() => {
                                setCurrentPage(
                                    currentPage < getTotalPages() - 1
                                        ? currentPage + 1
                                        : getTotalPages()
                                );
                            }}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}
            <Dialog
                open={open}
                handler={handleOpen}
                className="border-[--site-chat-header-border] border rounded-2xl from-[--site-main-modal-from-color] to-[--site-main-modal-to-color] bg-gradient-to-br shadow-lg shadow-[--site-card-icon-color]"
            >
                <DialogHeader>Are you sure?</DialogHeader>
                <DialogBody divider>
                    <span className="text-base text-black">
                        Are you sure to delete this AI Tutor?
                    </span>
                </DialogBody>
                <DialogFooter className="flex items-center justify-end gap-4 pb-8">
                    <button
                        onClick={handleOpen}
                        className="bg-transparent border-[--site-card-icon-color] text-[--site-card-icon-color] text-base font-semibold border rounded-md px-4 py-2"
                    >
                        cancel
                    </button>

                    <button
                        onClick={() => {
                            axios
                                .delete(`${webAPI.deletechat}/${id}`)
                                .then((res) => {
                                    notification("success", res.data.message);
                                    props.handleDelete();
                                })
                                .catch((err) => {
                                    console.error(
                                        "Failed to delete chat:",
                                        err
                                    );
                                });
                            handleOpen();
                        }}
                        className="px-4 py-2 text-base font-semibold text-white bg-[--site-card-icon-color] rounded-md"
                    >
                        confirm
                    </button>
                </DialogFooter>
            </Dialog>
            <Dialog
                open={isTransModal}
                handler={handleOpenTransModal}
                className="border-[--site-chat-header-border] border rounded-2xl from-[--site-main-modal-from-color] to-[--site-main-modal-to-color] bg-gradient-to-br shadow-lg shadow-[--site-card-icon-color]"
            >
                <DialogHeader>Transfer</DialogHeader>
                <DialogBody divider>
                    <span className="text-base text-black">
                        Input Customer Email to transfer this tutor.
                    </span>
                    <input
                        type="text"
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full h-10 px-5 py-3 bg-transparent border-[--site-main-modal-input-border-color] border rounded-md placeholder:text-black/60 placeholder:opacity-50"
                    />
                </DialogBody>
                <DialogFooter className="flex items-center justify-end gap-4 pb-8">
                    <button
                        onClick={handleOpenTransModal}
                        className="bg-transparent border-[--site-card-icon-color] text-[--site-card-icon-color] text-base font-semibold border rounded-md px-4 py-2"
                    >
                        cancel
                    </button>

                    <button
                        onClick={() => {
                            axios
                                .post(webAPI.transfer_tutor, {
                                    email,
                                    id,
                                })
                                .then((res) => {
                                    props.handleTransfer(res.data.message);
                                });
                            handleOpenTransModal();
                        }}
                        className="px-4 py-2 text-base font-semibold text-white bg-[--site-card-icon-color] rounded-md"
                    >
                        confirm
                    </button>
                </DialogFooter>
            </Dialog>

            <Chatmodal
                chat={currentchat}
                open={isModalOpen}
                handleOk={handleOk}
                handleCancel={handleCancel}
            />
        </div>
    );
};

export default ChatTable;
