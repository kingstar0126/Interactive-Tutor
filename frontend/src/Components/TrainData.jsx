import { useEffect, useState } from "react";
import ChatmodalTrain from "./ChatmodalTrain";
import { CircleStackIcon } from "@heroicons/react/24/solid";
import { webAPI } from "../utils/constants";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { getchat } from "../redux/actions/chatAction";

export default function TraindataTable() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [tableData, setTableData] = useState([]);
    const [reload, setReload] = useState(true);
    const chat = JSON.parse(useSelector((state) => state.chat.chat));
    const dispatch = useDispatch();

    useEffect(() => {
        get_traindata();
    }, []);

    const get_traindata = () => {
        let { uuid } = chat;
        let chatbot = { uuid };
        axios
            .post(webAPI.gettraindatas, chatbot)
            .then((res) => {
                console.log(res.data);
                if (res.data) {
                    setTableData(res.data);
                }
            })
            .catch((error) => console.log(error));
        setReload(!reload);
    };
    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleOk = (data) => {
        get_traindata();
        getchat(dispatch, data);
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
                get_traindata();
                getchat(dispatch, res.data.data);
            })
            .catch((err) => console.log(err));
    };

    return (
        <div className="flex flex-col w-full h-full gap-5 p-5">
            <div className="flex justify-end">
                <button
                    type="button"
                    onClick={showModal}
                    className="text-[--site-card-icon-color] bg-[--site-logo-text-color] hover:bg-[--site-card-icon-color]/90 focus:ring-4 focus:outline-none focus:ring-[--site-card-icon-color]/50 font-medium rounded-xl text-sm px-2 py-1 text-center inline-flex items-center dark:focus:ring-[--site-card-icon-color]/55"
                >
                    <CircleStackIcon className="w-[30px] h-[30px] text-xl pointer-events-none" />
                    Add Data
                </button>
            </div>
            <table className="bg-[--site-card-icon-color] text-sm text-left text-[--site-main-Table-Text] flex flex-col w-full">
                <thead className="text-xs rounded-tl-xl rounded-tr-xl flex w-full uppercase text-[--site-card-icon-color] bg-[--site-logo-text-color]">
                    <tr className="flex items-center justify-center w-full text-center">
                        <th className="w-2/5 px-6 py-3">Label</th>
                        <th className="w-1/5 px-6 py-3">type</th>
                        <th className="w-1/5 px-6 py-3">status</th>
                        <th className="w-1/5 px-6 py-3">Action</th>
                    </tr>
                </thead>

                <tbody className="flex flex-col w-full h-full text-center">
                    {tableData.map((data, index) => {
                        return (
                            <tr
                                className="bg-[--site-main-color3] text-[--site-card-icon-color] border-[1px] border-[--site-card-icon-color] flex items-center justify-center w-full"
                                key={index}
                            >
                                <th
                                    scope="row"
                                    className="px-6 w-2/5 py-4 font-bold text-[--site-card-icon-color] whitespace-nowrap flex items-center justify-center"
                                >
                                    <span className="flex items-center justify-center w-full text-center whitespace-normal">
                                        {data["label"]}
                                    </span>
                                </th>
                                <td className="w-1/5 px-6 py-4">
                                    {data["type"]}
                                </td>
                                <td className="flex items-center justify-center w-1/5 px-6 py-4">
                                    <div className="bg-[--site-success-text-color] rounded-full w-1/2">
                                        {"trained"}
                                    </div>
                                </td>
                                <td className="flex items-center justify-center w-1/5 gap-2 px-6 py-4">
                                    <div className="flex gap-2">
                                        <span
                                            onClick={() => {
                                                deleteTrain(data);
                                            }}
                                            className="text-[--site-card-icon-color] w-[60px] text-center hover:bg-[--site-main-form-error] border-[--site-main-form-error] hover:text-white p-2 border rounded-xl active:bg-[--site-main-form-error1] select-none active:text-white"
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
            <ChatmodalTrain
                open={isModalOpen}
                handleOk={handleOk}
                handleCancel={handleCancel}
            />
        </div>
    );
}
