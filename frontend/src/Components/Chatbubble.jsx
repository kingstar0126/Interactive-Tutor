import { useState, useRef, useEffect } from "react";
import { IoChatbubblesSharp } from "react-icons/io5";
import { Scrollbars } from "react-custom-scrollbars";
import { CodeBlock, dracula } from "react-code-blocks";
import axios from "axios";
import { webAPI } from "../utils/constants";
import { BsSendPlus } from "react-icons/bs";
import { Grid } from 'react-loader-spinner';
import toast, { Toaster } from "react-hot-toast";

const Chatbubble = () => {
    const bubbleWidget = useRef(null);
    const dialogWidget = useRef(null);
    const messagesEndRef = useRef(null);
    const [streamData, setStreamData] = useState('');
    const [click, setClick] = useState(true);
    const [chathistory, setChathistory] = useState([]);
    const [message, setMessage] = useState("");
    const [chat, setChat] = useState({});
    const [spinner, setSpinner] = useState(false);
    const [state, setState] = useState(false);
    const notification = (type, message) => {
        // To do in here
        if (type === "error") {
            toast.error(message);
        }
    };

    const handleSubmit = (event) => {
        if (!event.shiftKey && event.keyCode === 13 && spinner === false) {
            let _message = message;

            setChathistory([
                ...chathistory,
                { role: "human", content: _message },
            ]);
            sendMessage(_message);

            event.preventDefault();
            setMessage("");
        }
    };

    const handleSend = () => {
        let _message = message;

        setChathistory([...chathistory, { role: "human", content: _message }]);
        sendMessage(_message);
        setMessage("");
    };

    useEffect(() => {
        let id = "83137bf2-a589-476b-b9ad-43f63f4a7574";
        axios
            .post(webAPI.getchat, { id: id })
            .then((res) => {
                setChat(res.data.data);
                setChathistory([
                    { role: "ai", content: "How can I help you?" },
                ]);
            })
            .catch((err) => console.error(err));
    }, []);

    useEffect(() => {
        if (click === true) {
            dialogWidget.current.classList.add("hidden");
        } else {
            dialogWidget.current.classList.remove("hidden");
        }
    }, [click]);


    const sendMessage = async ( _message) => {
        if (!_message) {
            return;
        }
        setSpinner(true)
        setState(true)
        // Create a new FormData to send the necessary data
        const formData = new FormData();
        formData.append('_message', _message);
    
        // Send the formData to the streaming API
        fetch(webAPI.send_bubble_chat, {
            method: 'POST',
            body: formData
        })
        .then(async (response) => {
            let res = ''
            if (!response.ok) {
                if (response.status === 404) {
                    // Handle 404 error (Not found)
                    notification("error", "Not found tutor!")
                } else if (response.status === 401) {
                    // Handle 401 error (Unauthorized)
                    notification("error", "Insufficient queries remaining!")
                } else if (response.status === 500) {
                    // Handle 500 error (Internal server error)
                    notification("error", "The response is too long for this model. Please upgrade your model or enter a different prompt!")
                } else {
                    // Handle other error cases
                    notification("error", "The response is too long for this model. Please upgrade your model or enter a different prompt!")
                }
                throw new Error(`Network response was not ok - ${response.status}`);
            }
            // Read the response stream
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
    
            await reader.read().then(function process({ done, value }) {
                if (done) {
                    setStreamData('')
                    receiveMessage(res);
                    setSpinner(false);
                    return;
                }
                setState(false);
                let data = decoder.decode(value);
                res += data;
                setStreamData(res);

                return reader.read().then(process);
            });
        })
        .catch((error) => {
            console.error('There has been a problem with your fetch operation:', error);
            setSpinner(false);
        });
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      };

    useEffect(scrollToBottom, [chathistory, streamData]);

    const receiveMessage = (message) => {
        setChathistory((prevHistory) => [
            ...prevHistory,
            { role: "ai", content: message },
        ]);
    };

    return (
        <div>
            <div
                ref={dialogWidget}
                className="fixed right-[40px] bottom-[115px] rounded-xl bg-[--site-main-color10] border border-[--site-card-icon-color] flex flex-col items-center justify-center w-[400px] h-[600px] py-10 divide-y drop-shadow-xl"
            >
                <div className="w-full h-full from-[--site-main-modal-from-color] bg-gradient-to-br border border-[--site-main-modal-input-border-color] border-x-0">
                    <Scrollbars >
                        {chathistory.map((data, index) => {
                            return data.role === "human" && data.content ? (
                                <div
                                    name="human_bg"
                                    className="flex items-center justify-center p-2"
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
                                            className="text-[--site-card-icon-color] break-words whitespace-normal w-full flex p-2"
                                        >
                                            <span>{data.content}</span>
                                        </div>
                                    </div>
                                </div>
                            ) : data.role === "ai" && data.content ? (
                                <div
                                    name="ai_bg"
                                    className="flex items-center justify-center p-2"
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
                                            key={index}
                                            className="flex flex-col w-full p-2 text-block break-words whitespace-normal"
                                        >
                                            {data.content
                                                .split("```")
                                                .map((item, index) => {
                                                    if (
                                                        index === 0 ||
                                                        index % 2 === 0
                                                    ) {
                                                        return (
                                                            <span key={index}>
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
                                                                theme={dracula}
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
                        {spinner === true && <div
                                    className="flex items-center justify-start p-2 lg:justify-center"
                                >
                                    <div className="flex justify-start lg:w-4/5">
                                        <img
                                            src={chat.chat_logo.ai}
                                            className="w-10 h-10 rounded-full"
                                            alt="AI"
                                        />
                                        <div
                                            name="ai"
                                            className="flex flex-col w-full p-2 break-words whitespace-normal"
                                        >
                                            {streamData}
                                            {state && <Grid
                                                height="50"
                                                width="50"
                                                color="#4fa94d"
                                                ariaLabel="grid-loading"
                                                radius="12.5"
                                                wrapperStyle={{}}
                                                wrapperClass=""
                                                visible={true}
                                            />}
                                        </div>
                                    </div>
                                </div>}
                        <div ref={messagesEndRef} />
                    </Scrollbars>
                </div>

                <div className="flex items-center w-full mt-5 divide-x-2 sm:w-4/5">
                    <div className="flex items-center justify-end w-full text-black">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={handleSubmit}
                            className="w-full rounded-md border border-[--site-chat-header-border] bg-[--site-main-newchat-input-color] text-[--site-card-icon-color] block text-sm p-2.5 pr-9"
                            placeholder="Type message"
                        />

                        <span
                            onClick={() => {
                                handleSend();
                            }}
                            className="absolute pr-4"
                        >
                            <BsSendPlus />
                        </span>
                    </div>
                </div>
            </div>
            <div
                ref={bubbleWidget}
                onClick={() => setClick(!click)}
                className="fixed bottom-[40px] right-[40px]  w-16 h-16 rounded-full bg-[--site-logo-text-color] border-2 border-[--site-card-icon-color] items-center flex justify-center hover:bg-[--site-logo-text-color] hover:border-transparent hover:text-[--site-main-color3] transform hover:scale-110 transition-all duration-200 active:bg-[--site-card-icon-color]"
            >
                <IoChatbubblesSharp className="w-1/2 h-1/2 text-[--site-card-icon-color] pointer-events-none" />
            </div>
        </div>
    );
};

export default Chatbubble;
