import React, { useRef } from "react";
import "./styles.scss";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeMathjax from "rehype-mathjax";
import remarkMath from "remark-math";
import rehypeRaw from "rehype-raw";
import { CopyBlock, dracula } from "react-code-blocks";
import { BsDownload } from "react-icons/bs";
import CopyIcon from "../../../assets/icons/copy-24.png";
import toast from "react-hot-toast";
import { Spinner } from "@material-tailwind/react";

const ChatContent = (props) => {
  const { chat, isStreamData, isThinking } = props;

  const chatRef = useRef(null);

  const downloadImage = (src) => {
    const link = document.createElement("a");
    link.href = src;
    link.download = "image.jpg";
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = async (content) => {
    try {
      const html = chatRef.current;

      const success = await navigator.clipboard.write([
        new ClipboardItem({
          "text/plain": new Blob([html.innerText], { type: "text/plain" }),
          "text/html": new Blob([html.outerHTML], { type: "text/html" }),
        }),
      ]);
      toast.success("Text Copied");
      return success;
    } catch (e) {
      console.log("e", e);
      toast.error("Copy Unsuccessful");
    }
  };

  const handleCopyText = (content) => {
    if (!chatRef.current) {
      toast.error("Copy Unsuccessful");
      return;
    }
    copyToClipboard(content);
  };

  return chat.role === "human" && chat.content ? (
    <React.Fragment>
      <img
        className="chatbox-img"
        src="https://interactive-tutor-staging-public-asset.s3.eu-west-2.amazonaws.com/default_user.png"
        alt="User Image"
      />
      <div className="chatbox-message">{chat.content}</div>
    </React.Fragment>
  ) : chat.role === "ai" ? (
    <React.Fragment>
      <img
        className="chatbox-img"
        src="https://interactive-tutor-staging-public-asset.s3.eu-west-2.amazonaws.com/default_ai.png"
        alt="AI Image"
      />
      <div className="chatbox-message" ref={chatRef}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeMathjax, rehypeRaw]}
          children={chat.content}
          className="break-words whitespace-normal"
          components={{
            code({ inline, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || "");
              if (!inline && match) {
                // remove the newline character at the end of children, if it exists
                const codeString = String(children).replace(/\n$/, "");

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
        {isThinking && <Spinner color="pink" className="w-8 h-8" />}
      </div>
      {!isStreamData && (
        <div className="chatbox-action">
          <button
            className="action-button"
            title="Copy"
            onClick={() => handleCopyText(chat.content)}
          >
            <img src={CopyIcon} alt="Copy Icon" />
          </button>
        </div>
      )}
    </React.Fragment>
  ) : null;
};

export default ChatContent;
