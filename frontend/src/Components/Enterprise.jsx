import axios from "axios";
import { webAPI } from "../utils/constants";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import toast, { Toaster } from "react-hot-toast";
import { BsPersonFillAdd } from "react-icons/bs";
import { BsDatabaseFillGear } from "react-icons/bs";
import { AiOutlineMenu } from "react-icons/ai";
import { setOpenSidebar } from "../redux/actions/locationAction";
import { MdOutlineUpdate } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import {
    DialogHeader,
    Dialog,
    DialogBody,
    DialogFooter,
    Button,
    Input
} from "@material-tailwind/react";
import ReactSpeedometer from "react-d3-speedometer";

const Enterprise = () => {
    const [data, setData] = useState([]);
    const [open, setOpen] = useState(false);
    const [userEmail, setUserEmail] = useState("");
    const chatState = useSelector((state) => state.chat.chat);
    const _chat = chatState && JSON.parse(chatState) || {};
    const query = useSelector((state) => state.query.query);
    const [trial, setTrial] = useState(0);
    const navigate = useNavigate();
    const [validation, setValidation] = useState(false);
    const dispatch = useDispatch();
    const user = JSON.parse(useSelector((state) => state.user.user));
    
    const onChange = ({ target }) => {
        setUserEmail(target.value); 
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if(emailPattern.test(target.value)) {
            setValidation(true)
        } else {
            setValidation(false)
        }
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

    useEffect(() => {
        if (user.role === 5) {
            setTrial(user.days);
        }
        if (user.role !== 7 ) {
            navigate(-1)
        }
        getAlluser();
    }, []);

    const getAlluser = () => {
        axios
            .post(webAPI.getallusers, { id: user.id })
            .then((res) => {
                setData(res.data.data);
            })
            .catch((err) => console.error(err));
    };

    const handleOpenSidebar = () => {
        dispatch(setOpenSidebar());
    };

    const handleConfirm = () => {
        console.log("Confirm", userEmail)
        axios
            .post(webAPI.userInvite, {
                id: user.id,
                email: userEmail
            })
            .then((res) => {
                getAlluser();
                setOpen(false);
                notification("success", res.data.message);
            })
            .catch((err) => console.error(err));
    };

    const handleRemove = (item) => {
        axios
            .post(webAPI.userInviteRemove, { id: user.id, userId: item.id })
            .then((res) => {
                if (res.data.success) {
                    notification("success", res.data.message);
                    getAlluser();
                } else {
                    notification("error", res.data.message);
                }
            })
            .catch((err) => console.error(err));
    }

    return (
        <div className="w-full h-full">
            <Toaster />
            <div className="flex md:items-center items-end justify-between w-full md:h-[100px] md:px-10 from-[--site-chat-header-from-color] to-[--site-chat-header-to-color] md:border-b-[--site-chat-header-border] md:border bg-gradient-to-r px-4 py-2 max-h-min gap-1">
                <div className="hidden md:flex gap-2 mt-9 mb-8 text-[--site-card-icon-color]">
                    <BsDatabaseFillGear className="w-8 h-8" />
                    <span className="text-2xl font-semibold">Enter Prise</span>
                </div>
                <AiOutlineMenu
                    onClick={handleOpenSidebar}
                    className="w-6 h-6 mb-1 md:hidden"
                />
                <div className="flex items-end justify-end md:mt-[27px] md:mb-[30px] md:pr-[44px] pr-9">
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
                    <Button
                        onClick={() => {
                            navigate("/chatbot/subscription");
                        }}
                        className="normal-case flex p-2 rounded bg-[--site-logo-text-color] text-[--site-card-icon-color] ml-2"
                    >
                        <MdOutlineUpdate className="w-4 h-4 md:w-6 md:h-6" />
                        <span className="md:text-base text-[12px] font-medium">
                            Upgrade
                        </span>
                    </Button>
                </div>
            </div>

            <div className="flex md:hidden gap-2 text-[--site-card-icon-color] pt-8 px-5">
                <BsDatabaseFillGear className="w-8 h-8" />
                <span className="text-2xl font-semibold">Enter Prise</span>
            </div>

            <div className="bg-gradient-to-r from-[--site-chat-header-from-color] to-[--site-chat-header-to-color] border-[--site-chat-header-border] border rounded-xl md:m-10 m-5 flex flex-col gap-5 shadow-xl shadow-[--site-chat-header-border] overflow-x-auto">
                <div className="w-full h-full rounded-xl p-2">
                    <div className="flex items-center justify-end w-full p-2">
                        <Button
                            className="normal-case bg-[--site-logo-text-color] p-2 rounded-lg font-semibold text-base text-[--site-card-icon-color] flex gap-3 items-center justify-center"
                            onClick={(e) => setOpen(true)}
                        >
                            <BsPersonFillAdd className="fill-[ --site-card-icon-color] w-[20px] h-[20px]" />
                            Invite user
                        </Button>
                    </div>
                    <table className="w-full rounded-xl">
                        <thead className="rounded-xl">
                            <tr className="text-md font-semibold tracking-wide text-center text-[black] uppercase border-b border-gray-600 rounded-xl">
                                <th className="px-4 py-3 w-[50px]">No</th>
                                <th className="px-4 py-3 ">Name</th>
                                <th className="px-4 py-3 ">Email</th>
                                <th className="px-4 py-3 ">query</th>
                                <th className="px-4 py-3 ">usage</th>
                                <th className="px-4 py-3 ">Action</th>
                            </tr>
                        </thead>
                        <tbody className="text-center bg-white">
                            {data && data.map((item, index) => {
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
                                        <td className="px-4 py-3 font-semibold border text-ms">
                                            {item.query}
                                        </td>
                                        <td className="px-4 py-3 font-semibold border text-ms">
                                            {item.usage}
                                        </td>
                                        <td className="px-4 py-3 font-semibold border text-ms">
                                            <Button
                                                variant="outlined"
                                                onClick={() =>
                                                    handleRemove(item)
                                                }
                                                className=" normal-case p-2 rounded-lg hover:scale-110 border-[--site-error-text-color] text-[--site-error-text-color]"
                                            >
                                                Remove
                                            </Button>
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
                size={"sm"}
                handler={() => setOpen(false)}
                className="border-[--site-chat-header-border] border rounded-2xl from-[--site-main-modal-from-color] to-[--site-main-modal-to-color] bg-gradient-to-br shadow-lg shadow-[--site-card-icon-color]"
            >
                <Toaster />
                <DialogHeader className="px-8 pt-8 pb-6">
                    <span className="text-[32px] leading-12 font-semibold text-[--site-card-icon-color]">
                        Invite user
                    </span>
                </DialogHeader>
                <DialogBody className="border-t border-[--site-main-modal-divide-color] text-black text-base font-medium px-8 pt-6">
                    <div className="flex gap-2 relative w-full">
                        <input
                            type="email"
                            value={userEmail}
                            onChange={onChange}
                            className="w-full h-10 px-5 py-3 bg-transparent border-[--site-main-modal-input-border-color] border rounded-md placeholder:text-black/60 placeholder:opacity-50 focus:outline-[--site-card-icon-color]"
                        />
                        <Button
                            size="sm"
                            // color={!validation ? "gray" : "blue-gray"}
                            disabled={!validation}
                            className={` normal-case !absolute right-1 top-1 rounded ${ !validation ? "bg-gray-700" : "bg-[--site-card-icon-color]"}`}
                            onClick={() => handleConfirm()}
                        >
                            Invite
                        </Button>
                    </div>
                </DialogBody>
                <DialogFooter className="flex items-center justify-end px-8">
                    <Button
                            onClick={() => setOpen(false)}
                            className=" normal-case bg-transparent border-[--site-card-icon-color] text-[--site-card-icon-color] text-base font-semibold border rounded-md px-4 py-2"
                        >
                            cancel
                        </Button>
                </DialogFooter>
            </Dialog>
        </div>
    );
};

export default Enterprise;
