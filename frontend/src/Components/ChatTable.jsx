import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { webAPI } from "../utils/constants";
import Chatmodal from "./Chatmodal";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { getchat } from "../redux/actions/chatAction";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import { useNavigate } from "react-router-dom";

const ChatTable = (props) => {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const dispatch = useDispatch();
    const [currentchat, SetCurrentchat] = useState({});

    const showModal = () => {
        setIsModalOpen(true);
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
    const handleDelete = (id) => {
        confirmAlert({
            customUI: ({ onClose }) => {
                return (
                    <div className="flex flex-col px-12 py-5 text-white bg-[--site-main-color3] border-2 border-[--site-error-text-color]">
                        <div className="flex items-center justify-center w-full">
                            <span className="text-2xl font-bold text-[--site-error-text-color]">
                                Are you sure?
                            </span>
                        </div>
                        <div className="flex items-center justify-center w-full">
                            <p className="p-2 text-[--site-card-icon-color]">
                                Are you sure to delete this AI Tutor?
                            </p>
                        </div>
                        <div className="flex items-center justify-center w-full gap-2 p-2">
                            <button
                                className="w-1/2 px-4 py-2 font-bold text-[--site-error-text-color] bg-white ring-[--site-error-text-color] ring-[1px] rounded focus:outline-none"
                                onClick={onClose}
                            >
                                No
                            </button>
                            <button
                                className="w-1/2 px-4 py-2 font-bold text-white bg-[--site-error-text-color] rounded hover:bg-[--site-error-text-color] focus:outline-none"
                                onClick={() => {
                                    axios
                                        .delete(`${webAPI.deletechat}/${id}`)
                                        .then((res) => {
                                            notification(
                                                "success",
                                                res.data.message
                                            );
                                            props.handledelete();
                                        })
                                        .catch((err) => {
                                            console.error(
                                                "Failed to delete chat:",
                                                err
                                            );
                                            // Handle errors here
                                        });
                                    onClose();
                                }}
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                );
            },
        });
    };
    return (
        <div className="relative overflow-x-auto rounded-xl">
            <Toaster />
            <table className="w-full bg-[--site-card-icon-color] text-sm text-left text-[--site-main-Table-Text]">
                <thead className="text-xs text-[--site-main-Table-Tex] uppercase dark:bg-[--site-main-Table-Tex] dark:text-[--site-main-Table-Text_Dark]">
                    <tr className="flex w-full">
                        <th className="w-1/5 px-6 py-3">Label</th>
                        <th className="w-1/5 px-6 py-3">PIN</th>
                        <th className="hidden py-3 sm:w-1/5 sm:px-6 sm:flex">
                            Welcome message
                        </th>
                        <th className="hidden py-3 sm:w-1/5 sm:px-6 sm:block">
                            Behaviour prompt
                        </th>
                        <th className="w-1/5 px-6 py-3 text-center">Action</th>
                    </tr>
                </thead>

                <tbody>
                    {props.chat.map((data, index) => {
                        return (
                            <tr
                                className="bg-[--site-main-color3] text-[--site-card-icon-color] border-[1px] border-[--site-card-icon-color] w-full flex"
                                key={index}
                            >
                                <th
                                    scope="row"
                                    className="px-6 w-1/5 py-4 font-bold text-[--site-card-icon-color] whitespace-nowrap"
                                >
                                    {data["label"]}
                                </th>
                                <td className="w-1/5 px-6 py-4">
                                    {data["access"]}
                                </td>
                                <td className="hidden w-1/5 sm:px-6 sm:py-4 sm:flex">
                                    {data["conversation"]}
                                </td>
                                <td className="hidden w-1/5 sm:px-6 sm:py-4 sm:flex">
                                    {data["behavior"]}
                                </td>
                                <td
                                    className={`flex items-center justify-center gap-2 px-6 py-4 w-3/5 sm:w-1/5`}
                                >
                                    <div className="items-center justify-center pr-2 sm:flex sm:gap-2 sm:p-0">
                                        <span
                                            onClick={() => GetCurrentchat(data)}
                                            className="sm:w-[60px] text-[--site-card-icon-color] text-center hover:bg-[--site-main-form-success] hover:text-[--site-card-icon-color] p-2 border rounded-xl active:bg-[--site-main-form-success1] select-none active:text-[--site-card-icon-color] border-[--site-main-form-success]"
                                        >
                                            Open
                                        </span>
                                        <span
                                            onClick={() => {
                                                SetCurrentchat(data);
                                                showModal();
                                            }}
                                            className="sm:w-[60px] text-[--site-card-icon-color] text-center border-[--site-main-color9] hover:bg-[--site-main-color9] hover:text-white p-2 border rounded-xl active:bg-[--site-main-color4] select-none active:text-white"
                                        >
                                            Edit
                                        </span>
                                        <span
                                            onClick={() =>
                                                handleDelete(data["id"])
                                            }
                                            className="text-[--site-card-icon-color] sm:w-[60px] text-center hover:bg-[--site-main-form-error] border-[--site-main-form-error] hover:text-white p-2 border rounded-xl active:bg-[--site-main-form-error1] select-none active:text-white"
                                        >
                                            Delete
                                        </span>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
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
