import { useEffect, useRef } from "react";
import "./styles.scss";
import { Scrollbar } from "react-scrollbars-custom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeMathjax from "rehype-mathjax";
import remarkMath from "remark-math";
import rehypeRaw from "rehype-raw";
import { CopyBlock, dracula } from "react-code-blocks";
import { BsDownload } from "react-icons/bs";
import CopyIcon from "../../../assets/icons/copy-24.png";
import toast from "react-hot-toast";

const ChatContent = (props) => {
    const { chat, isStreamData } = props;

    const downloadImage = (src) => {
        const link = document.createElement("a");
        link.href = src;
        link.download = "image.jpg";
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleCopyText = () => {
        toast.success('Text Copied!')
    }

    useEffect(() => {
        console.log('ChatContent', chat);
    }, [chat]);

    return chat.role === "human" && chat.content ? (
        <div className="chatbox-wrapper">
            <img
                className="chatbox-img"
                src="https://interactive-tutor-staging-public-asset.s3.eu-west-2.amazonaws.com/default_user.png"
                alt="User Image"
            />
            <div className="chatbox-message">
                {chat.content}
            </div>
        </div>
    ) : chat.role === "ai" && chat.content ? (
        <div className="chatbox-wrapper ai-bot">
            <img
                className="chatbox-img"
                src="https://interactive-tutor-staging-public-asset.s3.eu-west-2.amazonaws.com/default_ai.png"
                alt="AI Image"
            />
            <div className="chatbox-message">
                <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkMath]}
                    rehypePlugins={[rehypeMathjax, rehypeRaw]}
                    children={chat.content}
                    className="break-words whitespace-normal"
                    components={{
                        code({
                            inline,
                            className,
                            children,
                            ...props
                        }) {
                            const match = /language-(\w+)/.exec(
                                className || ""
                            );
                            if (!inline && match) {
                                // remove the newline character at the end of children, if it exists
                                const codeString = String(children).replace(
                                    /\n$/,
                                    ""
                                );

                                return (
                                    <CopyBlock
                                        text={codeString}
                                        language={match[1]}
                                        showLineNumbers={false}
                                        wrapLongLines
                                        theme={dracula}
                                        {...props}
                                    />
                                );
                            }
                            return (
                                <code className={className} {...props}>
                                    {children}
                                </code>
                            );
                        },
                        table({ children, ...props }) {
                            return (
                                <table
                                    style={{
                                        borderCollapse: "collapse",
                                        width: "100%",
                                        fontFamily: "Arial, sans-serif",
                                        fontSize: "14px",
                                    }}
                                    {...props}
                                >
                                    {children}
                                </table>
                            );
                        },
                        tr({ children, ...props }) {
                            return (
                                <tr
                                    style={{
                                        backgroundColor: "#f8f8f8",
                                    }}
                                    {...props}
                                >
                                    {children}
                                </tr>
                            );
                        },
                        td({ children, ...props }) {
                            return (
                                <td
                                    style={{
                                        padding: "8px",
                                        border: "1px solid #ddd",
                                    }}
                                    {...props}
                                >
                                    {children}
                                </td>
                            );
                        },
                        th({ children, ...props }) {
                            return (
                                <th
                                    style={{
                                        padding: "8px",
                                        border: "1px solid #ddd",
                                        fontWeight: "bold",
                                        textAlign: "left",
                                    }}
                                    {...props}
                                >
                                    {children}
                                </th>
                            );
                        },
                        a({ href, children, ...props }) {
                            return (
                                <a
                                    style={{
                                        color: "#007bff",
                                        textDecoration: "none",
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
                        img({ node, src, alt }) {
                            return (
                                <div className="relative">
                                    <img src={src} alt={alt} />
                                    <button
                                        onClick={() => downloadImage(src)}
                                        className="absolute top-2 right-2 text-black bg-transparent border-none"
                                    >
                                        <BsDownload />
                                    </button>
                                </div>
                            );
                        },
                    }}
                />
                {!isStreamData && <div className="chatbox-action">
                    <button className="action-button" title="Copy Text" onClick={handleCopyText}>
                        <img src={CopyIcon} alt="Copy Icon" />
                    </button>
                </div>}
            </div>
        </div>
    ) : null;
};

export default ChatContent;
