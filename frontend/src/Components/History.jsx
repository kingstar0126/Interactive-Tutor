import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Scrollbar } from "react-scrollbars-custom";
import { CodeBlock, dracula } from "react-code-blocks";
import { AiFillDelete } from "react-icons/ai";
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
        <div className="flex w-full h-full">
            <div className="flex flex-col  w-1/3 h-screen p-2 border-r-[1px] border-[--site-main-color3]">
                <Scrollbar>
                    {history.map((item, index) => {
                        return (
                            <div
                                key={index}
                                onClick={(e) => handleMessage(index)}
                                className={
                                    index % 2
                                        ? "p-2 flex items-center justify-center w-full gap-3 bg-[--site-logo-text-color] rounded-xl mb-2"
                                        : "p-2 flex items-center justify-center w-full gap-3 bg-[--site-main-form-success1] rounded-xl mb-2"
                                }
                            >
                                <img
                                    src={chat.chat_logo.user}
                                    alt="human"
                                    className="w-10 h-10"
                                />
                                <div className="flex justify-between w-full">
                                    <span className="text-[--site-main-color3]">
                                        {item.name}
                                    </span>
                                    <AiFillDelete
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
            <div className="flex flex-col w-2/3 h-screen">
                {message && (
                    <Scrollbar name="scroll content">
                        {message &&
                            message.map((data, index) => {
                                return data.role === "human" && data.content ? (
                                    <div
                                        name="human_bg"
                                        className={
                                            "flex items-center justify-center p-2 bg-[" +
                                            chat.chat_logo.user_bg +
                                            "]"
                                        }
                                        key={index}
                                    >
                                        <div className="flex w-2/3">
                                            <img
                                                src={chat.chat_logo.user}
                                                alt="human"
                                                className="w-10 h-10"
                                            />
                                            <div
                                                name="human"
                                                className="text-[--site-logo-text-color] whitespace-break-spaces w-full flex p-2"
                                            >
                                                <span>{data.content}</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : data.role === "ai" && data.content ? (
                                    <div
                                        name="ai_bg"
                                        className={
                                            "flex items-center justify-center p-2 bg-[" +
                                            chat.chat_logo.ai_bg +
                                            "]"
                                        }
                                        key={index}
                                    >
                                        <div className="flex w-2/3">
                                            <img
                                                src={chat.chat_logo.ai}
                                                className="w-10 h-10"
                                                alt="AI"
                                            />
                                            <div
                                                name="ai"
                                                className="text-[--site-main-color3] whitespace-break-spaces w-full flex flex-col p-2"
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
