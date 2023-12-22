import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Scrollbar } from "react-scrollbars-custom";
import { dracula, CopyBlock } from "react-code-blocks";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeMathjax from "rehype-mathjax";
import remarkMath from "remark-math";
import rehypeRaw from "rehype-raw";
import { RiDeleteBin6Line } from "react-icons/ri";
import { webAPI } from "../utils/constants";
import axios from "axios";

const History = (props) => {
    const [history, setHistory] = useState([]);
    const [index, setIndex] = useState(0);
    const chat = JSON.parse(useSelector((state) => state.chat.chat));
    const chatbot = useSelector((state) => state.chat.chatbot);
    useEffect(() => {
        setHistory(props.data);
    }, [props.data]);

    const handleMessage = (index) => {
        setIndex(index);
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
            <div className="flex flex-col h-1/3 sm:w-1/3 sm:h-screen text-[--site-hisotry-text] pb-6">
                <Scrollbar>
                    {history.map((item, id) => {
                        return (
                            <div
                                key={id}
                                onClick={() => handleMessage(id)}
                                className={`p-2 flex items-center justify-center w-full gap-3 ${
                                    index === id
                                        ? "bg-[--site-threedot-background]"
                                        : "bg-[--site-history-background]"
                                }  rounded-xl mb-2`}
                            >
                                <img
                                    src={chat.chat_logo.user}
                                    alt="human"
                                    className="w-10 h-10 rounded-full"
                                />
                                <div className="flex items-center justify-between w-full">
                                    <span className="w-4/5 leading-5 flex-col flex">
                                        <span>{item.name}</span>
                                        <span>{item.update_data}</span>
                                    </span>
                                    <RiDeleteBin6Line
                                        className="active:fill-[--site-card-icon-color] fill-[--site-history-delete-color]"
                                        onClick={() => handleDelete(item, id)}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </Scrollbar>
            </div>
            <div className="sm:h-screen h-2/3 sm:w-2/3">
                {history[index] && history[index].message && (
                    <Scrollbar name="scroll content">
                        {history[index].message &&
                            history[index].message.map((data, index) => {
                                return data.role === "human" && data.content ? (
                                    <div
                                        name="human_bg"
                                        className={
                                            "flex items-center justify-start md:pl-12 pb-4 bg-[" +
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
                                                className="text-[--site-card-icon-color] break-words whitespace-normal w-full flex p-2"
                                            >
                                                <span>{data.content}</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : data.role === "ai" && data.content ? (
                                    <div
                                        name="ai_bg"
                                        className={
                                            "flex items-center justify-start md:pl-12 pb-4 bg-[" +
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
                                                className="flex flex-col w-full p-2 break-words whitespace-normal"
                                            >
                                                <ReactMarkdown
                                                    remarkPlugins={[
                                                        remarkGfm,
                                                        remarkMath,
                                                    ]}
                                                    rehypePlugins={[
                                                        rehypeMathjax,
                                                        rehypeRaw,
                                                    ]}
                                                    children={data.content}
                                                    className="break-words whitespace-normal"
                                                    components={{
                                                        code({
                                                            inline,
                                                            className,
                                                            children,
                                                            ...props
                                                        }) {
                                                            const match =
                                                                /language-(\w+)/.exec(
                                                                    className ||
                                                                        ""
                                                                );
                                                            if (
                                                                !inline &&
                                                                match
                                                            ) {
                                                                // remove the newline character at the end of children, if it exists
                                                                const codeString =
                                                                    String(
                                                                        children
                                                                    ).replace(
                                                                        /\n$/,
                                                                        ""
                                                                    );

                                                                return (
                                                                    <CopyBlock
                                                                        text={
                                                                            codeString
                                                                        }
                                                                        language={
                                                                            match[1]
                                                                        }
                                                                        showLineNumbers={
                                                                            false
                                                                        }
                                                                        wrapLongLines
                                                                        theme={
                                                                            dracula
                                                                        }
                                                                        {...props}
                                                                    />
                                                                );
                                                            }
                                                            return (
                                                                <code
                                                                    className={
                                                                        className
                                                                    }
                                                                    {...props}
                                                                >
                                                                    {children}
                                                                </code>
                                                            );
                                                        },
                                                        table({
                                                            children,
                                                            ...props
                                                        }) {
                                                            return (
                                                                <table
                                                                    style={{
                                                                        borderCollapse:
                                                                            "collapse",
                                                                        width: "100%",
                                                                        fontFamily:
                                                                            "Arial, sans-serif",
                                                                        fontSize:
                                                                            "14px",
                                                                    }}
                                                                    {...props}
                                                                >
                                                                    {children}
                                                                </table>
                                                            );
                                                        },
                                                        tr({
                                                            children,
                                                            ...props
                                                        }) {
                                                            return (
                                                                <tr
                                                                    style={{
                                                                        backgroundColor:
                                                                            "#f8f8f8",
                                                                    }}
                                                                    {...props}
                                                                >
                                                                    {children}
                                                                </tr>
                                                            );
                                                        },
                                                        td({
                                                            children,
                                                            ...props
                                                        }) {
                                                            return (
                                                                <td
                                                                    style={{
                                                                        padding:
                                                                            "8px",
                                                                        border: "1px solid #ddd",
                                                                    }}
                                                                    {...props}
                                                                >
                                                                    {children}
                                                                </td>
                                                            );
                                                        },
                                                        th({
                                                            children,
                                                            ...props
                                                        }) {
                                                            return (
                                                                <th
                                                                    style={{
                                                                        padding:
                                                                            "8px",
                                                                        border: "1px solid #ddd",
                                                                        fontWeight:
                                                                            "bold",
                                                                        textAlign:
                                                                            "left",
                                                                    }}
                                                                    {...props}
                                                                >
                                                                    {children}
                                                                </th>
                                                            );
                                                        },
                                                        a({
                                                            href,
                                                            children,
                                                            ...props
                                                        }) {
                                                            return (
                                                                <a
                                                                    style={{
                                                                        color: "#007bff",
                                                                        textDecoration:
                                                                            "none",
                                                                    }}
                                                                    href={href}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    {...props}
                                                                >
                                                                    {children}
                                                                </a>
                                                            );
                                                        },
                                                    }}
                                                />
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
