import "./styles.scss";
import ChatContent from "./ChatContent";
import { useEffect } from "react";

const ChatBox = (props) => {
  const { chats, chatLogo, isStreamData, isThinking } = props;

  return (
    <div className="chatbox-constainer">
      {chats.map((data, index) => {
        return (
          <div className="chatbox-wrapper" key={index}>
            <ChatContent
              chat={data}
              chatLogo={chatLogo}
              keys={index}
              isStreamData={isStreamData}
              isThinking={isThinking}
            />
          </div>
        );
      })}
    </div>
  );
};

export default ChatBox;
