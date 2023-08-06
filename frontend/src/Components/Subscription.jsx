import { useEffect } from "react";
import { useState } from "react";
import { Toaster } from "react-hot-toast";
import { AiOutlineTrophy, AiOutlineMenu } from "react-icons/ai";
import { getUseraccount } from "../redux/actions/userAction";
import { useSelector, useDispatch } from "react-redux";
import { getUserState } from "../redux/actions/userAction";
import { setquery } from "../redux/actions/queryAction";
import ReactSpeedometer from "react-d3-speedometer";
import { MdOutlineUpdate } from "react-icons/md";
import axios from "axios";
import { webAPI } from "../utils/constants";
import Report from "./Report";
import { Slider, Button } from "@material-tailwind/react";
import SubscriptionModal from "./SubscriptionModal";
import { setOpenSidebar } from "../redux/actions/locationAction";

const Subscription = () => {
    const dispatch = useDispatch();
    const query = useSelector((state) => state.query.query);
    const user = JSON.parse(useSelector((state) => state.user.user));
    const chat = JSON.parse(useSelector((state) => state.chat.chat));
    const [trial, setTrial] = useState(0);
    const [datas, setDatas] = useState([]);
    const [labels, setLabels] = useState(null);
    const [index_length, setIndex_length] = useState(0);
    const [datasources, setDataSources] = useState(null);
    const [isopenModal, setIsOpenModal] = useState(false);

    useEffect(() => {
        getUseraccount(dispatch, { id: user.id });
        getUserState(dispatch, { id: user.id });
        setquery(dispatch, user.query);
        if (user.role === 5) {
            setTrial(user.days);
        }
        if (chat) {
            get_traindata();
        }
        axios
            .post(webAPI.get_report_data, { id: user.id })
            .then((res) => {
                const one = res.data.data.slice(0, -1);
                const two = res.data.data.slice(-1);

                const combineData = (arr1, arr2) => {
                    return arr1.map((item, index) => [...item, arr2[0][index]]);
                };

                const datasets = combineData(one, two);

                const currentDate = new Date();
                const totalDays = new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth() + 1,
                    0
                ).getDate();
                const labels = Array.from(
                    { length: totalDays + 1 },
                    (_, i) => `${i}`
                );
                setLabels(labels);
                if (datasets.length > 0 && datasets[0]) {
                    setIndex_length(datasets[0].length);
                } else {
                    setIndex_length(0);
                }
                setDatas(datasets);
            })
            .catch((err) => console.error(err));
        if (user.role === undefined || user.role === 0) {
            handleOpenModel();
        }
    }, []);

    const handleOpenModel = () => {
        setIsOpenModal(!isopenModal);
    };

    const handleOpenSidebar = () => {
        dispatch(setOpenSidebar());
    };

    const get_traindata = () => {
        axios
            .post(webAPI.gettraindatas, { uuid: chat.uuid })
            .then((res) => {
                if (res.data.success) {
                    setDataSources(res.data.data.length);
                }
            })
            .catch((error) => console.log(error));
    };
    return (
        <div className="w-full h-full">
            <Toaster />

            <div className="flex md:items-center items-end justify-between w-full md:h-[100px] md:px-10 from-[--site-chat-header-from-color] to-[--site-chat-header-to-color] md:border-b-[--site-chat-header-border] md:border bg-gradient-to-r px-4 py-2 max-h-min gap-1">
                <div className="hidden md:flex gap-2 mt-9 mb-8 text-[--site-card-icon-color]">
                    <AiOutlineTrophy className="w-8 h-8" />
                    <span className="text-2xl font-semibold">
                        Subscriptions
                    </span>
                </div>
                <AiOutlineMenu
                    onClick={handleOpenSidebar}
                    className="w-6 h-6 mb-1 md:hidden"
                />
                <div className="flex items-end justify-end md:mt-[27px] md:mb-[30px] md:pr-[44px] pr-9">
                    {chat && chat.organization && (
                        <div className="xl:flex flex-col items-start justify-center mr-2 p-2 bg-[--site-warning-text-color] rounded shadow-2xl hidden">
                            <p>
                                <span className="font-bold text-[14px]">
                                    Organisation ID:{" "}
                                </span>
                                <span className="text-[--site-error-text-color] font-semibold">
                                    {chat.organization}
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
                        onClick={() => {
                            handleOpenModel();
                        }}
                        className="flex p-2 rounded bg-[--site-logo-text-color] text-[--site-card-icon-color] ml-2"
                    >
                        <MdOutlineUpdate className="w-4 h-4 md:w-6 md:h-6" />
                        <span className="md:text-base text-[12px] font-medium">
                            Upgrade
                        </span>
                    </button>
                </div>
            </div>
            <div className="flex md:hidden gap-2 text-[--site-card-icon-color] pt-8 px-5">
                <AiOutlineTrophy className="w-8 h-8" />
                <span className="text-2xl font-semibold">Subscriptions</span>
            </div>

            <div className="flex flex-col gap-6 px-5 py-8 md:px-10">
                {index_length !== 0 && (
                    <div className="flex flex-col w-[99.33%]  bg-gradient-to-r from-[--site-chat-header-from-color] to-[--site-chat-header-to-color] border-[--site-chat-header-border] border rounded-2xl shadow-xl shadow-[--site-chat-header-border] 2xl:min-h-[20rem] h-auto">
                        <span className="text-[16px] items-start w-full pt-4 px-4">
                            Users
                        </span>
                        <Report
                            labels={labels}
                            datas={datas}
                            index={index_length}
                        />
                    </div>
                )}
                <div className="flex flex-col w-[99.33%]  bg-gradient-to-r from-[--site-chat-header-from-color] to-[--site-chat-header-to-color] border-[--site-chat-header-border] border rounded-2xl shadow-xl shadow-[--site-chat-header-border] 2xl:min-h-[20rem] h-auto py-8 px-4">
                    <div className="w-full px-2">
                        <span className="text-black text-[24px] font-semibold">
                            Queries
                        </span>
                        <div className="flex items-center gap-2 mt-4">
                            {user.maxquery - query !== 0 ? (
                                <Slider
                                    size="lg"
                                    id="queries"
                                    value={
                                        ((user.maxquery - query) /
                                            user.maxquery) *
                                        100
                                    }
                                    className="text-[#6EAE1C] opacity-50"
                                    trackClassName="[&::-webkit-slider-runnable-track]:bg-[--site-logo-text-color] [&::-moz-range-track]:bg-[--site-logo-text-color] rounded-full !bg-[--site-logo-text-color] border border-[--site-logo-text-color] pointer-events-none"
                                />
                            ) : (
                                <Slider
                                    size="lg"
                                    id="queries123"
                                    defaultValue={0}
                                    className="text-[#6EAE1C] opacity-50"
                                    trackClassName="[&::-webkit-slider-runnable-track]:bg-[--site-logo-text-color] [&::-moz-range-track]:bg-[--site-logo-text-color] rounded-full !bg-[--site-logo-text-color] border border-[--site-logo-text-color] pointer-events-none"
                                />
                            )}
                            <Button
                                variant="outlined"
                                className="ring-[--site-logo-text-color] border-0 ring-2 text-[12px] sm:text-[16px] font-semibold text-[--site-card-icon-color] rounded-full px-1 py-1 sm:py-3 sm:px-6"
                                onClick={() => {
                                    handleOpenModel();
                                }}
                            >
                                Upgrade
                            </Button>
                        </div>
                    </div>
                    {datas && (
                        <div className="w-full px-2">
                            <span className="text-black text-[24px] font-semibold">
                                Tutors
                            </span>
                            <div className="flex items-center gap-2 mt-4">
                                {datas.length !== 0 ? (
                                    <Slider
                                        size="lg"
                                        id="tutors"
                                        value={
                                            (datas.length / user.tutors) * 100
                                        }
                                        className="text-[#6EAE1C] opacity-50"
                                        trackClassName="[&::-webkit-slider-runnable-track]:bg-[--site-logo-text-color] [&::-moz-range-track]:bg-[--site-logo-text-color] rounded-full !bg-[--site-logo-text-color] border border-[--site-logo-text-color] pointer-events-none"
                                    />
                                ) : (
                                    <Slider
                                        size="lg"
                                        id="tutors123"
                                        defaultValue={0}
                                        className="text-[#6EAE1C] opacity-50"
                                        trackClassName="[&::-webkit-slider-runnable-track]:bg-[--site-logo-text-color] [&::-moz-range-track]:bg-[--site-logo-text-color] rounded-full !bg-[--site-logo-text-color] border border-[--site-logo-text-color] pointer-events-none"
                                    />
                                )}

                                <Button
                                    variant="outlined"
                                    className="ring-[--site-logo-text-color] border-0 ring-2 sm:text-[16px] font-semibold text-[--site-card-icon-color] rounded-full px-1 py-1 sm:py-3 sm:px-6 text-[12px]"
                                    onClick={() => {
                                        handleOpenModel();
                                    }}
                                >
                                    Upgrade
                                </Button>
                            </div>
                        </div>
                    )}
                    {datasources > 0 ? (
                        <div className="w-full px-2">
                            <span className="text-black text-[24px] font-semibold">
                                Data Sources
                            </span>
                            <div className="flex items-center gap-2 mt-4">
                                <Slider
                                    size="lg"
                                    id="datasources"
                                    value={
                                        ((datasources < user.training_datas
                                            ? datasources
                                            : user.training_datas) /
                                            user.training_datas) *
                                        100
                                    }
                                    className="text-[#6EAE1C] opacity-50"
                                    trackClassName="[&::-webkit-slider-runnable-track]:bg-[--site-logo-text-color] [&::-moz-range-track]:bg-[--site-logo-text-color] rounded-full !bg-[--site-logo-text-color] border border-[--site-logo-text-color] pointer-events-none"
                                />
                                <Button
                                    variant="outlined"
                                    className="ring-[--site-logo-text-color] border-0 ring-2 font-semibold text-[--site-card-icon-color] rounded-full px-1 py-1 sm:py-3 sm:px-6 text-[12px] sm:text-[16px]"
                                    onClick={() => {
                                        handleOpenModel();
                                    }}
                                >
                                    Upgrade
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="w-full px-2">
                            <span className="text-black text-[24px] font-semibold">
                                Data Sources
                            </span>
                            <div className="flex items-center gap-2 mt-4">
                                <Slider
                                    size="lg"
                                    id="datasources"
                                    defaultValue={0}
                                    className="text-[#6EAE1C] opacity-50"
                                    trackClassName="[&::-webkit-slider-runnable-track]:bg-[--site-logo-text-color] [&::-moz-range-track]:bg-[--site-logo-text-color] rounded-full !bg-[--site-logo-text-color] border border-[--site-logo-text-color] pointer-events-none"
                                />
                                <Button
                                    variant="outlined"
                                    className="ring-[--site-logo-text-color] border-0 ring-2 font-semibold text-[--site-card-icon-color] rounded-full px-1 py-1 sm:py-3 sm:px-6 text-[12px] sm:text-[16px]"
                                    onClick={() => {
                                        handleOpenModel();
                                    }}
                                >
                                    Upgrade
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <SubscriptionModal
                open={isopenModal}
                handleCancel={() => handleOpenModel()}
            />
        </div>
    );
};
export default Subscription;
