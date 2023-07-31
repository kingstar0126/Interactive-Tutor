import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Scrollbar } from "react-scrollbars-custom";
import { CodeBlock, dracula } from "react-code-blocks";
import { RiDeleteBin6Line } from "react-icons/ri";
import { webAPI } from "../utils/constants";
import axios from "axios";

const History = (props) => {
    const [history, setHistory] = useState([]);
    const [message, setMessage] = useState([]);
    const chat = JSON.parse(useSelector((state) => state.chat.chat));
    const chatbot = useSelector((state) => state.chat.chatbot);
    useEffect(() => {
        const new_data = props.data.sort((a, b) => {
            return new Date(a.update_data) - new Date(b.update_data);
        });
        setHistory(new_data);
    }, [props.data]);

    const handleMessage = (index) => {
        setMessage(history[index].message);
    };

    const handleDelete = (item, index) => {
        if (item.uuid !== chatbot) {
            axios
                .post(webAPI.delete_message, { id: item.uuid })
                .then((res) => {
                    const new_history = [...history];
                    new_history.splice(index, 1);
                    setHistory(new_history);
                })
                .catch((err) => console.error(err));
        }
    };
    return (
        <div className="flex flex-col w-full h-screen p-6 sm:flex-row">
            <div className="flex flex-col h-1/3 sm:w-1/3 sm:h-screen text-[--site-card-icon-color]">
                <Scrollbar>
                    {history.map((item, index) => {
                        return (
                            <div
                                key={index}
                                onClick={() => handleMessage(index)}
                                className={
                                    index % 2
                                        ? "p-2 flex items-center justify-center w-full gap-3 bg-[#C1FF72] rounded-xl mb-2"
                                        : "p-2 flex items-center justify-center w-full gap-3 bg-[#2DC937] rounded-xl mb-2"
                                }
                            >
                                <img
                                    src={chat.chat_logo.user}
                                    alt="human"
                                    className="w-10 h-10 rounded-full"
                                />
                                <div className="flex items-center justify-between w-full">
                                    <span className="w-4/5 leading-5">
                                        {item.name}
                                    </span>
                                    <RiDeleteBin6Line
                                        className="active:fill-[--site-card-icon-color] fill-[--site-error-text-color]"
                                        onClick={() =>
                                            handleDelete(item, index)
                                        }
                                    />
                                </div>
                            </div>
                        );
                    })}
                </Scrollbar>
            </div>
            <div className="sm:h-screen h-2/3 sm:w-2/3">
                {message && (
                    <Scrollbar name="scroll content">
                        {message &&
                            message.map((data, index) => {
                                return data.role === "human" && data.content ? (
                                    <div
                                        name="human_bg"
                                        className={
                                            "flex items-center justify-start pl-12 pb-4 bg-[" +
                                            chat.chat_logo.user_bg +
                                            "]"
                                        }
                                        key={index}
                                    >
                                        <div className="flex items-start w-full">
                                            <img
                                                src={chat.chat_logo.user}
                                                alt="human"
                                                className="w-10 h-10 rounded-full"
                                            />
                                            <div
                                                name="human"
                                                className="text-[--site-card-icon-color] whitespace-break-spaces w-full flex p-2"
                                            >
                                                <span>{data.content}</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : data.role === "ai" && data.content ? (
                                    <div
                                        name="ai_bg"
                                        className={
                                            "flex items-center justify-start pl-12 pb-4 bg-[" +
                                            chat.chat_logo.ai_bg +
                                            "]"
                                        }
                                        key={index}
                                    >
                                        <div className="flex items-start w-full">
                                            <img
                                                src={chat.chat_logo.ai}
                                                className="w-10 h-10 rounded-full"
                                                alt="AI"
                                            />
                                            <div
                                                name="ai"
                                                className="flex flex-col w-full p-2 whitespace-break-spaces"
                                            >
                                                {data.content
                                                    .split("```")
                                                    .map((item, index) => {
                                                        if (
                                                            index === 0 ||
                                                            index % 2 === 0
                                                        ) {
                                                            return (
                                                                <span
                                                                    key={index}
                                                                >
                                                                    {item}
                                                                </span>
                                                            );
                                                        } else {
                                                            return (
                                                                <CodeBlock
                                                                    key={index}
                                                                    text={item}
                                                                    language={
                                                                        "javascript"
                                                                    }
                                                                    showLineNumbers={
                                                                        false
                                                                    }
                                                                    wrapLongLines={
                                                                        true
                                                                    }
                                                                    theme={
                                                                        dracula
                                                                    }
                                                                    wrapLines
                                                                />
                                                            );
                                                        }
                                                    })}
                                            </div>
                                        </div>
                                    </div>
                                ) : null;
                            })}
                    </Scrollbar>
                )}
            </div>
        </div>
    );
};

export default History;
