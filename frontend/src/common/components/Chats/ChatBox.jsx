import { useEffect, useRef } from "react";
import "./styles.scss";
import ChatContent from "./ChatContent";

const ChatBox = (props) => {
    const { chats, isStreamData } = props;

    useEffect(() => {
        console.log('ChatBox', chats);
    }, [chats]);

    return (
        <div className="chatbox-constainer">
            {chats.map((data, index) => {
                return (
                    <div key={index}>
                        <ChatContent chat={data} keys={index} isStreamData={isStreamData} />
                    </div>
                )
            })}
        </div>
    );
};

export default ChatBox;
