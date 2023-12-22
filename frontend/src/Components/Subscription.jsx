import { useEffect } from "react";
import { useState } from "react";
import { Toaster } from "react-hot-toast";
import { getUseraccount } from "../redux/actions/userAction";
import { useSelector, useDispatch } from "react-redux";
import { setquery } from "../redux/actions/queryAction";
import axios from "axios";
import { webAPI } from "../utils/constants";
import Report from "./Report";
import { Slider, Button } from "@material-tailwind/react";
import SubscriptionModal from "./SubscriptionModal";
import { useNavigate } from "react-router-dom";
import SubscriptionLogo from "../assets/Icons_outlined.svg";

const Subscription = () => {
    const dispatch = useDispatch();
    const query = useSelector((state) => state.query.query);
    const user = JSON.parse(useSelector((state) => state.user.user));
    const chat = JSON.parse(useSelector((state) => state.chat.chat));
    const [datas, setDatas] = useState([]);
    const [labels, setLabels] = useState(null);
    const [index_length, setIndex_length] = useState(0);
    const [datasources, setDataSources] = useState(null);
    const [isopenModal, setIsOpenModal] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        axios
            .post(webAPI.checkUserInvite, { id: user.id })
            .then((res) => {
                if (res.data.success) {
                    navigate(-1);
                }
            })
            .catch((err) => console.error(err));
        getUseraccount(dispatch, { id: user.id });
        setquery(dispatch, user.query);
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

    const get_traindata = () => {
        if (chat.uuid) {
            axios
                .post(webAPI.gettraindatas, { uuid: chat.uuid })
                .then((res) => {
                    if (res.data.success) {
                        setDataSources(res.data.data.length);
                    }
                })
                .catch((error) => console.log(error));
        }
    };

    return (
        <div className="w-full h-full">
            <Toaster className="z-30" />

            <div className="flex md:items-center items-end w-full md:h-[80px] shadow-md md:px-10 md:border-b-[--site-chat-header-border] md:border px-4 py-2 max-h-min gap-1">
                <div className="hidden md:flex gap-2 mt-9 mb-8 text-[--site-onboarding-primary-color]">
                    <img
                        src={SubscriptionLogo}
                        alt="subscription"
                        className="w-8 h-8"
                    />
                    <span className="text-2xl font-semibold">
                        Current Subscriptions
                    </span>
                </div>
            </div>

            <div className="px-8 py-6 h-full">
                <div className="flex flex-col h-full gap-6 p-8 border-[--site-chat-header-border] border rounded-md shadow-xl shadow-[--site-chat-header-border]">
                    {index_length !== 0 && (
                        <div className="flex flex-col w-[99.33%] border-[--site-chat-header-border] border rounded-md shadow-xl shadow-[--site-chat-header-border] 2xl:min-h-[20rem] h-auto">
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
                    <div className="flex flex-col w-[99.33%] border-[--site-chat-header-border] border rounded-md shadow-xl shadow-[--site-chat-header-border] py-8 px-4 gap-5">
                        <div className="w-full px-2 flex gap-3 items-center justity-between">
                            <span className="text-black text-lg font-semibold w-40">
                                Queries
                            </span>

                            {user.maxquery - query !== 0 ? (
                                <Slider
                                    size="md"
                                    id="queries"
                                    value={
                                        ((user.maxquery - query) /
                                            user.maxquery) *
                                        100
                                    }
                                    className="text-[--site-success-text-color]"
                                    trackClassName="[&::-webkit-slider-runnable-track]:bg-gray-300 [&::-moz-range-track]:bg-[--site-success-text-color] rounded-full !bg---site-success-text-color] pointer-events-none"
                                />
                            ) : (
                                <Slider
                                    size="md"
                                    id="queries123"
                                    defaultValue={0}
                                    className="text-[--site-success-text-color]"
                                    trackClassName="[&::-webkit-slider-runnable-track]:bg-gray-300 [&::-moz-range-track]:bg-[--site-success-text-color] rounded-full !bg-[--site-success-text-color] pointer-events-none"
                                />
                            )}
                            <Button
                                variant="outlined"
                                className="normal-case text-[--site-onboarding-primary-color] border border-[--site-onboarding-primary-color] font-medium text-base text-center items-center gap-2 p-2 flex w-36 justify-center"
                                onClick={() => {
                                    handleOpenModel();
                                }}
                            >
                                Upgrade
                            </Button>
                        </div>
                        {datas && (
                            <div className="w-full px-2 flex gap-3 items-center justity-center">
                                <span className="text-black text-lg font-semibold w-40">
                                    Tutors
                                </span>

                                {datas.length !== 0 ? (
                                    <Slider
                                        size="md"
                                        id="tutors"
                                        value={
                                            (datas.length / user.tutors) * 100
                                        }
                                        className="text-[--site-success-text-color]"
                                        trackClassName="[&::-webkit-slider-runnable-track]:bg-gray-300 [&::-moz-range-track]:bg-[--site-success-text-color] rounded-full !bg---site-success-text-color] pointer-events-none"
                                    />
                                ) : (
                                    <Slider
                                        size="md"
                                        id="queries123"
                                        defaultValue={0}
                                        className="text-[--site-success-text-color]"
                                        trackClassName="[&::-webkit-slider-runnable-track]:bg-gray-300 [&::-moz-range-track]:bg-[--site-success-text-color] rounded-full !bg-[--site-success-text-color] pointer-events-none"
                                    />
                                )}

                                <Button
                                    variant="outlined"
                                    className="normal-case text-[--site-onboarding-primary-color] border border-[--site-onboarding-primary-color] font-medium text-base text-center items-center gap-2 p-2 flex w-36 justify-center"
                                    onClick={() => {
                                        handleOpenModel();
                                    }}
                                >
                                    Upgrade
                                </Button>
                            </div>
                        )}
                        {datasources > 0 ? (
                            <div className="w-full px-2 flex gap-3 items-center justity-center">
                                <span className="text-black text-lg font-semibold w-40">
                                    Data Sources
                                </span>

                                <Slider
                                    size="md"
                                    id="datasources"
                                    value={
                                        ((datasources < user.training_datas
                                            ? datasources
                                            : user.training_datas) /
                                            user.training_datas) *
                                        100
                                    }
                                    className="text-[--site-success-text-color]"
                                    trackClassName="[&::-webkit-slider-runnable-track]:bg-gray-300 [&::-moz-range-track]:bg-[--site-success-text-color] rounded-full !bg---site-success-text-color] pointer-events-none"
                                />
                                <Button
                                    variant="outlined"
                                    className="normal-case text-[--site-onboarding-primary-color] border border-[--site-onboarding-primary-color] font-medium text-base text-center items-center gap-2 p-2 flex w-36 justify-center"
                                    onClick={() => {
                                        handleOpenModel();
                                    }}
                                >
                                    Upgrade
                                </Button>
                            </div>
                        ) : (
                            <div className="w-full px-2 flex gap-3 items-center justity-center">
                                <span className="text-black text-lg font-semibold w-40">
                                    Data Sources
                                </span>

                                <Slider
                                    size="md"
                                    id="datasources"
                                    defaultValue={0}
                                    className="text-[--site-success-text-color]"
                                    trackClassName="[&::-webkit-slider-runnable-track]:bg-gray-300 [&::-moz-range-track]:bg-[--site-success-text-color] rounded-full !bg---site-success-text-color] pointer-events-none"
                                />
                                <Button
                                    variant="outlined"
                                    className="normal-case text-[--site-onboarding-primary-color] border border-[--site-onboarding-primary-color] font-medium text-base text-center items-center gap-2 p-2 flex w-36 justify-center"
                                    onClick={() => {
                                        handleOpenModel();
                                    }}
                                >
                                    Upgrade
                                </Button>
                            </div>
                        )}
                    </div>
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
