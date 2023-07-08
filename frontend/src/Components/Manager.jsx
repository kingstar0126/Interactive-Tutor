import axios from "axios";
import { webAPI } from "../utils/constants";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import toast, { Toaster } from "react-hot-toast";
import { BsPersonFillAdd } from "react-icons/bs";
import { BsDatabaseFillGear } from "react-icons/bs";
import StripeCard from "./StripeCard";

const Manager = () => {
    const [data, setData] = useState([]);
    const [isOpenModal, setIsOpenModal] = useState(false);

    const handleOk = () => {
        getAlluser();
        setIsOpenModal(false);
    };
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
            .then((res) => setData(res.data.data))
            .catch((err) => console.error(err));
    };

    const handleChange = (id, current_status) => {
        const status = current_status === 0 ? 1 : 0;
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

    const handleDelete = (id) => {
        console.log("id", id);
        axios
            .post(webAPI.deleteuser, { id })
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
                                <th className="px-4 py-3 ">Phone</th>
                                <th className="px-4 py-3 ">Address</th>
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
                                        <td className="px-4 py-3 text-sm border">
                                            {item.contact}
                                        </td>
                                        <td className="px-4 py-3 font-semibold border text-ms">
                                            {item.state !== null &&
                                                item.state +
                                                    ", " +
                                                    item.city +
                                                    ", " +
                                                    item.country}
                                        </td>
                                        <td className="px-4 py-3 font-semibold border text-ms">
                                            {/* {item.subscription} */} 1
                                        </td>
                                        <td className="px-4 py-3 font-semibold border text-ms">
                                            {item.status !== 0 ? (
                                                <span className="px-2 py-1 font-semibold leading-tight rounded-lg bg-[--site-error-text-color] text-[--site-main-color3]">
                                                    Block
                                                </span>
                                            ) : (
                                                <span className="px-2 py-1 font-semibold leading-tight bg-[--site-logo-text-color] rounded-lg">
                                                    Accept
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 font-semibold border text-ms">
                                            <button
                                                onClick={(e) =>
                                                    handleChange(
                                                        item.id,
                                                        item.status
                                                    )
                                                }
                                                className="mr-5 p-2 bg-[--site-logo-text-color] w-[80px] text-[--site-card-icon-color] rounded-lg hover:scale-110"
                                            >
                                                {item.status === 0
                                                    ? "Block"
                                                    : "Unblock"}
                                            </button>
                                            <button
                                                onClick={(e) =>
                                                    handleDelete(item.id)
                                                }
                                                className="p-2 rounded-lg hover:scale-110 bg-[--site-error-text-color] text-white"
                                            >
                                                delete
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <StripeCard
                open={isOpenModal}
                handleOk={handleOk}
                handleCancel={handleCancel}
            />
        </div>
    );
};

export default Manager;
