import { useEffect, useState } from "react";
import ChatmodalTrain from "./ChatmodalTrain";
import { HiOutlineCircleStack } from "react-icons/hi2";
import { webAPI } from "../utils/constants";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { getchat } from "../redux/actions/chatAction";
import toast, { Toaster } from "react-hot-toast";
import { Typography, Chip, Button, Tooltip } from "@material-tailwind/react";

export default function TraindataTable(props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [tableData, setTableData] = useState([]);
    const chatState = useSelector((state) => state.chat.chat);
    const chat = (chatState && JSON.parse(chatState)) || {};
    const dispatch = useDispatch();
    const TABLE_HEAD = ["LABEL", "TYPE", "STATUS", "ACTION"];
    const [currentPage, setCurrentPage] = useState(1);
    const [trainData, setTrainData] = useState([]);
    const itemsPerPage = 5;

    useEffect(() => {
        get_traindata();
    }, [props.data]);

    const getTotalPages = () => {
        return Math.ceil(trainData.length / itemsPerPage);
    };

    const notification = (type, message) => {
        if (type === "error") {
            toast.error(message);
        }
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
    }, [currentPage]);

    const getCurrentPageData = () => {
        const { firstIndex, lastIndex } = getPaginationRange();
        return trainData.slice(firstIndex, lastIndex);
    };

    const get_traindata = () => {
        axios
            .post(webAPI.gettraindatas, { uuid: chat.uuid })
            .then((res) => {
                if (res.data.data) {
                    setTrainData(res.data.data);
                    setTableData(res.data.data.slice(0, itemsPerPage));
                }
            })
            .catch((error) => console.log(error));
    };
    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleOk = (data) => {
        get_traindata();
        if (data) {
            getchat(dispatch, data);
        }

        setIsModalOpen(false);
    };
    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const deleteTrain = (data) => {
        let { uuid } = chat;
        let traindata = { uuid: uuid, id: data.id };

        axios
            .post(webAPI.deletetrain, traindata)
            .then((res) => {
                if (res.data.success) {
                    get_traindata();
                    getchat(dispatch, res.data.data);
                }
                else {
                    notification("error", res.data.message);
                }
            })
            .catch((err) => console.log(err));
    };

    return (
        <div className="flex flex-col w-full h-full gap-5 py-5">
            <Toaster className="z-30"/>
            <div className="flex justify-end px-5 ">
                <Button
                    type="button"
                    onClick={showModal}
                    variant="outlined"
                    className="normal-case text-[--site-onboarding-primary-color] border border-[--site-onboarding-primary-color] font-medium text-base text-center items-center gap-2 p-2 flex"
                >
                    <HiOutlineCircleStack className="w-[30px] h-[30px] text-xl pointer-events-none" />
                    <span>Add Data</span>
                </Button>
            </div>
            <div className="flex">
                <table className="text-left table-fixed sm:w-full min-h-[20rem] w-full">
                    <thead className="border-b border-[--site-main-modal-input-border-color]">
                        <tr className="flex sm:grid sm:grid-cols-5">
                            {TABLE_HEAD.map((head) => (
                                <th
                                    key={head}
                                    className={
                                        head === "LABEL"
                                            ? "sm:py-2 sm:px-5 w-1/4 sm:w-auto pl-2 sm:col-span-2 pb-2"
                                            : "sm:py-2 sm:px-5 w-1/4 sm:w-auto pl-2 pb-2"
                                    }
                                >
                                    <Typography
                                        variant="small"
                                        className="font-normal leading-none text-[--site-card-icon-color]"
                                    >
                                        {head}
                                    </Typography>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {tableData.map((data, index) => {
                            const classes =
                                "sm:py-2 sm:px-5 w-1/4 sm:w-auto pl-2 pb-2";

                            return (
                                <tr
                                    key={data["label"]}
                                    className="flex sm:grid sm:grid-cols-5"
                                >
                                    <td
                                        className={
                                            "sm:col-span-2 sm:py-2 sm:px-5 w-1/4 sm:w-auto "
                                        }
                                    >
                                        <div className="flex items-center h-full gap-3 overflow-x-auto">
                                            <div className="flex flex-col">
                                                <Typography
                                                    variant="small"
                                                    color="blue-gray"
                                                    className="font-normal break-words"
                                                >
                                                    {data["label"]}
                                                </Typography>
                                            </div>
                                        </div>
                                    </td>
                                    <td className={classes}>
                                        <div className="flex items-center justify-center h-full w-max">
                                            {data['type']}
                                        </div>
                                    </td>
                                    <td className={classes}>
                                        <div className="flex items-center justify-center h-full w-max">
                                            {data["status"] ? (
                                                <Chip
                                                    variant="ghost"
                                                    size="sm"
                                                    value={"Trained"}
                                                    className="bg-[--site-logo-text-color] text-[--site-card-icon-color] normal-case"
                                                />
                                            ) : (
                                                <Chip
                                                    variant="ghost"
                                                    size="sm"
                                                    value={"Processing"}
                                                    className="bg-[--site-warning-text-color] text-[--site-card-icon-color] normal-case"
                                                />
                                            )}
                                        </div>
                                    </td>

                                    <td className={classes}>
                                        <div className="flex items-center justify-center h-full w-max">
                                            <Tooltip content="Delete training data">
                                                <Button
                                                    onClick={() => {
                                                        deleteTrain(data);
                                                    }}
                                                    variant="filled"
                                                    className="normal-case font-semibold rounded-md text-base px-2 py-1 bg-[--site-onboarding-primary-color] text-center inline-flex items-center text-white"
                                                >
                                                    Delete
                                                </Button>
                                            </Tooltip>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            {trainData.length > 5 && (
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

            <ChatmodalTrain
                open={isModalOpen}
                handleOk={handleOk}
                handleCancel={handleCancel}
            />
        </div>
    );
}
