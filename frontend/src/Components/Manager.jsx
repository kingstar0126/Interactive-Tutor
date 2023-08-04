import axios from "axios";
import { webAPI } from "../utils/constants";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import toast, { Toaster } from "react-hot-toast";
import { BsPersonFillAdd } from "react-icons/bs";
import { BsDatabaseFillGear } from "react-icons/bs";
import StripeCard from "./StripeCard";
import {
    DialogHeader,
    Dialog,
    DialogBody,
    DialogFooter,
} from "@material-tailwind/react";
import { Scrollbar } from "react-scrollbars-custom";

const Manager = () => {
    const [data, setData] = useState([]);
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [open, setOpen] = useState(false);
    const handleOk = () => {
        getAlluser();
        setIsOpenModal(false);
    };
    const [item, setItem] = useState({});
    const handleCancel = () => {
        setIsOpenModal(false);
    };

    const user = JSON.parse(useSelector((state) => state.user.user));

    const notification = (type, message) => {
        // To do in here
        if (type === "error") {
            toast.error(message);
        }
        if (type === "success") {
            toast.success(message);
        }
    };

    useEffect(() => {
        getAlluser();
    }, []);

    const getAlluser = () => {
        axios
            .post(webAPI.getallusers, { id: user.id })
            .then((res) => {
                setData(res.data.data);
                console.log(res.data.data);
            })
            .catch((err) => console.error(err));
    };

    const handleChange = (id, current_status) => {
        console.log(current_status, typeof current_status);
        const status = current_status === "0" ? 1 : 0;
        console.log(status);
        axios
            .post(webAPI.changeuserstatus, { id, status })
            .then((res) => {
                if (res.data.code === 200) {
                    notification("success", res.data.message);
                    getAlluser();
                } else {
                    notification("error", res.data.message);
                }
            })
            .catch((err) => console.error(err));
    };

    const getSubscriptionName = (role) => {
        switch (role) {
            case 0:
                return (
                    <span className="px-2 py-1 font-semibold leading-tight rounded-lg bg-[#fa1717] text-[white]">
                        Free Trial Ended
                    </span>
                );
            case 1:
                return (
                    <span className="px-2 py-1 font-semibold leading-tight rounded-lg bg-[#0fAfff] text-[white]">
                        Manager
                    </span>
                );
            case 2:
                return (
                    <span className="px-2 py-1 font-semibold leading-tight rounded-lg bg-[#0fAf00] text-[white]">
                        Starter
                    </span>
                );
            case 3:
                return (
                    <span className="px-2 py-1 font-semibold leading-tight rounded-lg bg-[#e329f0] text-[white]">
                        Standard
                    </span>
                );
            case 4:
                return (
                    <span className="px-2 py-1 font-semibold leading-tight rounded-lg bg-[#5d18e6] text-[white]">
                        Pro
                    </span>
                );
            case 5:
                return (
                    <span className="px-2 py-1 font-semibold leading-tight rounded-lg bg-[#1cf7c4] text-[white]">
                        Free trial
                    </span>
                );
            case 6:
                return (
                    <span className="px-2 py-1 font-semibold leading-tight rounded-lg bg-[#b9f71c] text-[white]">
                        Customer
                    </span>
                );
            default:
                throw new Error("Invalid role encountered.");
        }
    };

    return (
        <div className="w-full h-full p-4 pl-5 pr-10">
            <Toaster />
            <div className="flex items-center justify-between p-5 bg-[--site-card-icon-color] rounded-full">
                <div className="flex items-center justify-center gap-2 font-semibold text-[20px] text-white">
                    <BsDatabaseFillGear className="fill-[--site-logo-text-color]" />
                    Manager
                </div>
            </div>
            <div className="py-5">
                <div className="bg-[--site-card-icon-color] w-full h-full rounded-xl p-2">
                    <div className="flex items-center justify-end w-full p-2">
                        <button
                            className="bg-[--site-logo-text-color] p-2 rounded-lg font-semibold text-[--site-card-icon-color] flex gap-3 items-center justify-center"
                            onClick={(e) => setIsOpenModal(true)}
                        >
                            <BsPersonFillAdd className="fill-[ --site-card-icon-color] w-[20px] h-[20px]" />
                            Add user
                        </button>
                    </div>
                    <table className="w-full rounded-xl">
                        <thead className="rounded-xl">
                            <tr className="text-md font-semibold tracking-wide text-center text-[--site-main-color3] uppercase border-b border-gray-600 rounded-xl">
                                <th className="px-4 py-3 w-[50px]">No</th>
                                <th className="px-4 py-3 ">Name</th>
                                <th className="px-4 py-3 ">Email</th>
                                <th className="px-4 py-3 ">Usage</th>
                                <th className="px-4 py-3 ">query</th>
                                <th className="px-4 py-3 ">Data Sources</th>
                                <th className="px-4 py-3 ">Subscription</th>
                                <th className="px-4 py-3 ">Status</th>
                                <th className="px-4 py-3 ">Action</th>
                            </tr>
                        </thead>
                        <tbody className="text-center bg-white">
                            {data.map((item, index) => {
                                return (
                                    <tr className="text-gray-700" key={index}>
                                        <td className="px-4 py-3 border">
                                            <div className="flex items-center justify-center text-[14px]">
                                                {index + 1}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 font-semibold border text-ms">
                                            {item.username}
                                        </td>
                                        <td className="px-4 py-3 font-medium border text-ms">
                                            {item.email}
                                        </td>
                                        <td className="px-4 py-3 text-ms font-semibold border">
                                            {item.usage}
                                        </td>
                                        <td className="px-4 py-3 font-semibold border text-ms">
                                            {item.query}
                                        </td>
                                        <td className="px-4 py-3 font-semibold border text-ms">
                                            {item.training_datas}
                                        </td>
                                        <td className="px-4 py-3 font-semibold border text-ms">
                                            {getSubscriptionName(item.role)}
                                        </td>
                                        <td className="px-4 py-3 font-semibold border text-ms">
                                            {item.status === "0" ? (
                                                <span className="px-2 py-1 font-semibold leading-tight rounded-lg bg-[#22fa17] text-[white]">
                                                    Accept
                                                </span>
                                            ) : (
                                                <span className="px-2 py-1 font-semibold leading-tight rounded-lg bg-[#fa1717] text-[white]">
                                                    Block
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 font-semibold border text-ms">
                                            <button
                                                onClick={() => {
                                                    setItem(item);
                                                    setOpen(true);
                                                }}
                                                className="mr-5 p-2 bg-[--site-logo-text-color] w-[80px] text-[--site-card-icon-color] rounded-lg hover:scale-110"
                                            >
                                                Change
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleChange(
                                                        item.id,
                                                        item.status
                                                    )
                                                }
                                                className="p-2 rounded-lg hover:scale-110 bg-[--site-error-text-color] text-white"
                                            >
                                                Block
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <Dialog
                open={open}
                size={"lg"}
                handler={() => setOpen(false)}
                className="border-[--site-chat-header-border] border rounded-2xl from-[--site-main-modal-from-color] to-[--site-main-modal-to-color] bg-gradient-to-br shadow-lg shadow-[--site-card-icon-color]"
            >
                <DialogHeader className="px-8 pt-8 pb-6">
                    <span className="text-[32px] leading-12 font-semibold text-[--site-card-icon-color]">
                        Chat
                    </span>
                </DialogHeader>
                <DialogBody className="border-t border-[--site-main-modal-divide-color] text-black text-base font-medium pl-8 pt-6 h-[30rem]">
                    <Scrollbar>
                        <div className="mr-4">
                            <div>{item.username}</div>
                            <div>{item.email}</div>
                        </div>
                    </Scrollbar>
                </DialogBody>
                <DialogFooter className="flex items-center justify-end gap-4 px-10 pb-8">
                    <button
                        onClick={() => setOpen(false)}
                        className="bg-transparent border-[--site-card-icon-color] text-[--site-card-icon-color] text-base font-semibold border rounded-md px-4 py-2"
                    >
                        cancel
                    </button>
                    <button
                        onClick={() => setOpen(false)}
                        className="px-4 py-2 text-base font-semibold text-white bg-[--site-card-icon-color] rounded-md"
                    >
                        confirm
                    </button>
                </DialogFooter>
            </Dialog>

            <StripeCard
                open={isOpenModal}
                handleOk={handleOk}
                handleCancel={handleCancel}
            />
        </div>
    );
};

export default Manager;
