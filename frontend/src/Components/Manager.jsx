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
import { Select, Option, Button } from "@material-tailwind/react";
import { useNavigate } from "react-router-dom";
import {
    DialogHeader,
    Dialog,
    DialogBody,
    DialogFooter,
} from "@material-tailwind/react";
import { Scrollbar } from "react-scrollbars-custom";
import ReactSpeedometer from "react-d3-speedometer";

const Manager = () => {
    const [data, setData] = useState([]);
    const [open, setOpen] = useState(false);
    const [userEmail, setUserEmail] = useState("");
    const [userQueryCount, setUserQueryCount] = useState(0);
    const [role, setRole] = useState(1);
    const [userTutorCount, setUserTutorCount] = useState(0);
    const [userTrainCount, setUserTrainCount] = useState(0);
    const [userWordCount, setUserWordCount] = useState(0);
    const [search, setSearch] = useState("");
    const chatState = useSelector((state) => state.chat.chat);
    const _chat = chatState && JSON.parse(chatState) || {};
    const query = useSelector((state) => state.query.query);
    const [trial, setTrial] = useState(0);
    const navigate = useNavigate();
    const [item, setItem] = useState({});
    const dispatch = useDispatch();
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
        if (user.role === 5) {
            setTrial(user.days);
        }
        if (user.role !== 1) {
            navigate(-1)
        }
        getAlluser();
    }, []);

    const getAlluser = () => {
        axios
            .post(webAPI.getallusers, { id: user.id, search })
            .then((res) => {
                let data = res.data.data.filter(item => item.role !== 0)
                setData(data);
            })
            .catch((err) => console.error(err));
    };

    const handleChange = (id, current_status) => {
        const status = current_status === "0" ? 1 : 0;
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

    const handleOpenSidebar = () => {
        dispatch(setOpenSidebar());
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
            case 7:
                return (
                    <span className="px-2 py-1 font-semibold leading-tight rounded-lg bg-[#89ee45] text-[white]">
                        Enter Prise
                    </span>
                );
            case 8:
                return (
                    <span className="px-2 py-1 font-semibold leading-tight rounded-lg bg-[#0000f7] text-[white]">
                        Enter Prise
                    </span>
                );
            default:
                throw new Error("Invalid role encountered.");
        }
    };

    const handleConfirm = () => {
        if (
            userQueryCount &&
            userTrainCount &&
            userWordCount &&
            userTutorCount &&
            role
        ) {
            axios
                .post(webAPI.change_user_limitation, {
                    email: userEmail,
                    tutor: userTutorCount,
                    query: userQueryCount,
                    train: userTrainCount,
                    word: userWordCount,
                    role: role
                })
                .then((res) => {
                    getAlluser();
                    setOpen(false);
                    notification("success", res.data.message);
                })
                .catch((err) => console.error(err));
        } else {
            setOpen(false);
            notification("error", "Please fill all values")
        }
    };

    const OptionRoles = [
        {
            value: "1",
            label: "Manager",
        },
        {
            value: "2",
            label: "Starter",
        },
        {
            value: "3",
            label: "Standard",
        },
        {
            value: "4",
            label: "Pro",
        },
        {
            value: "5",
            label: "Free trial",
        },
        {
            value: "6",
            label: "Customer",
        },
        {
            value: "7",
            label: "EnterPrise",
        }
    ]

    useEffect(() => {
        const typingTimer = setTimeout(() => {
            getAlluser();
          }, 500);
        return () => clearTimeout(typingTimer);
    }, [search])
    return (
        <div className="w-full h-full">
            <Toaster />
            <div className="flex md:items-center items-end justify-between w-full md:h-[100px] md:px-10 from-[--site-chat-header-from-color] to-[--site-chat-header-to-color] md:border-b-[--site-chat-header-border] md:border bg-gradient-to-r px-4 py-2 max-h-min gap-1">
                <div className="hidden md:flex gap-2 mt-9 mb-8 text-[--site-card-icon-color]">
                    <BsDatabaseFillGear className="w-8 h-8" />
                    <span className="text-2xl font-semibold">Manager</span>
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
                        className=" normal-case flex p-2 rounded bg-[--site-logo-text-color] text-[--site-card-icon-color] ml-2"
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
                <span className="text-2xl font-semibold">Manager</span>
            </div>

            <div className="bg-gradient-to-r from-[--site-chat-header-from-color] to-[--site-chat-header-to-color] border-[--site-chat-header-border] border rounded-xl md:m-10 m-5 flex flex-col gap-5 shadow-xl shadow-[--site-chat-header-border] overflow-x-auto">
                <div className="w-full h-full rounded-xl p-2">
                    <div className="flex items-center justify-end w-full p-2 gap-2">
                        <span>Search</span>
                        <input
                            type="text"
                            name="search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-1/3 h-10 px-5 py-3 bg-transparent border-[--site-main-modal-input-border-color] border rounded-md placeholder:text-black/60 placeholder:opacity-50"
                        />
                    </div>
                    <table className="w-full rounded-xl">
                        <thead className="rounded-xl">
                            <tr className="text-md font-semibold tracking-wide text-center text-[black] uppercase border-b border-gray-600 rounded-xl">
                                <th className="px-4 py-3 w-[50px]">No</th>
                                <th className="px-4 py-3 ">Name</th>
                                <th className="px-4 py-3 ">Email</th>
                                <th className="px-4 py-3 ">Tutors</th>
                                <th className="px-4 py-3 ">query</th>
                                {/* <th className="px-4 py-3 ">usage</th> */}
                                <th className="px-4 py-3 ">Data Sources</th>
                                <th className="px-4 py-3 ">Subscription</th>
                                <th className="px-4 py-3 ">Status</th>
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
                                        <td className="px-4 py-3 text-ms font-semibold border">
                                            {item.tutors}
                                        </td>
                                        <td className="px-4 py-3 font-semibold border text-ms">
                                            {item.query}
                                        </td>
                                        {/* <td className="px-4 py-3 font-semibold border text-ms">
                                            {item.usage}
                                        </td> */}
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
                                            <Button
                                                onClick={() => {
                                                    setUserEmail(item.email);
                                                    setUserTutorCount(
                                                        item.tutors
                                                    );
                                                    setRole(item.role);
                                                    setUserQueryCount(
                                                        item.query
                                                    );
                                                    setUserTrainCount(
                                                        item.training_datas
                                                    );
                                                    setUserWordCount(
                                                        item.training_words
                                                    );
                                                    setItem(item);
                                                    setOpen(true);
                                                }}
                                                variant="outlined"
                                                className="normal-case mr-5 p-2 border-[#0f6d09] w-[80px] text-[#0f6d09] rounded-lg hover:scale-110"
                                            >
                                                Change
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                onClick={() =>
                                                    handleChange(
                                                        item.id,
                                                        item.status
                                                    )
                                                }
                                                className=" normal-case p-2 rounded-lg hover:scale-110 border-[--site-error-text-color] text-[--site-error-text-color]"
                                            >
                                                Block
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
                size={"lg"}
                handler={() => setOpen(false)}
                className="border-[--site-chat-header-border] border rounded-2xl from-[--site-main-modal-from-color] to-[--site-main-modal-to-color] bg-gradient-to-br shadow-lg shadow-[--site-card-icon-color]"
            >
                <DialogHeader className="px-8 pt-8 pb-6">
                    <span className="text-[32px] leading-12 font-semibold text-[--site-card-icon-color]">
                        Change Account
                    </span>
                </DialogHeader>
                <DialogBody className="border-t border-[--site-main-modal-divide-color] text-black text-base font-medium pl-8 pt-6 h-[30rem]">
                    <Scrollbar>
                        <div className="mr-4 flex flex-col gap-2">
                            <div className="flex flex-col">
                                <label>UserName</label>
                                <input
                                    type="text"
                                    name="username"
                                    readOnly
                                    value={item.username || ""}
                                    className="w-full h-10 px-5 py-3 bg-transparent border-[--site-main-modal-input-border-color] border rounded-md placeholder:text-black/60 placeholder:opacity-50"
                                />
                            </div>
                            <div className="flex flex-col">
                                <label>User email</label>
                                <input
                                    type="text"
                                    name="email"
                                    readOnly
                                    value={item.email || ""}
                                    className="w-full h-10 px-5 py-3 bg-transparent border-[--site-main-modal-input-border-color] border rounded-md placeholder:text-black/60 placeholder:opacity-50"
                                />
                            </div>
                            <div className="flex flex-col">
                                <label>User Tutors</label>
                                <input
                                    type="text"
                                    name="email"
                                    onChange={(e) =>
                                        setUserTutorCount(e.target.value)
                                    }
                                    value={userTutorCount}
                                    className="w-full h-10 px-5 py-3 bg-transparent border-[--site-main-modal-input-border-color] border rounded-md placeholder:text-black/60 placeholder:opacity-50"
                                />
                            </div>

                            <div className="flex flex-col">
                                <label>User Query</label>
                                <input
                                    type="text"
                                    name="email"
                                    onChange={(e) =>
                                        setUserQueryCount(e.target.value)
                                    }
                                    value={userQueryCount}
                                    className="w-full h-10 px-5 py-3 bg-transparent border-[--site-main-modal-input-border-color] border rounded-md placeholder:text-black/60 placeholder:opacity-50"
                                />
                            </div>
                            <div className="flex flex-col">
                                <label>User Training data</label>
                                <input
                                    type="text"
                                    name="email"
                                    onChange={(e) =>
                                        setUserTrainCount(e.target.value)
                                    }
                                    value={userTrainCount}
                                    className="w-full h-10 px-5 py-3 bg-transparent border-[--site-main-modal-input-border-color] border rounded-md placeholder:text-black/60 placeholder:opacity-50"
                                />
                            </div>
                            <div className="flex flex-col">
                                <label>User Account</label>
                                <Select
                                    className="w-full h-10 px-5 py-3 bg-transparent border-[--site-main-modal-input-border-color] border rounded-md placeholder:text-black/60 placeholder:opacity-50"
                                    onChange={e => setRole(e)}
                                    value={role.toString()}
                                >
                                    {OptionRoles.map((role, index) => <Option value={role.value} key={index}>{role.label}</Option>)}
                                </Select>
                            </div>
                            <div className="flex flex-col">
                                <label>User Training words</label>
                                <input
                                    type="text"
                                    name="email"
                                    onChange={(e) =>
                                        setUserWordCount(e.target.value)
                                    }
                                    value={userWordCount}
                                    className="w-full h-10 px-5 py-3 bg-transparent border-[--site-main-modal-input-border-color] border rounded-md placeholder:text-black/60 placeholder:opacity-50"
                                />
                            </div>
                        </div>
                    </Scrollbar>
                </DialogBody>
                <DialogFooter className="flex items-center justify-end gap-4 px-10 pb-8">
                    <Button
                        onClick={() => setOpen(false)}
                        className=" normal-case bg-transparent border-[--site-card-icon-color] text-[--site-card-icon-color] text-base font-semibold border rounded-md px-4 py-2"
                    >
                        cancel
                    </Button>
                    <Button
                        onClick={() => handleConfirm()}
                        className=" normal-case px-4 py-2 text-base font-semibold text-white bg-[--site-card-icon-color] rounded-md"
                    >
                        confirm
                    </Button>
                </DialogFooter>
            </Dialog>
        </div>
    );
};

export default Manager;
