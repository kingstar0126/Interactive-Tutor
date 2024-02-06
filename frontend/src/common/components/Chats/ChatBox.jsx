import "./styles.scss";
import ChatContent from "./ChatContent";

const ChatBox = (props) => {
  const { chats, isStreamData, isThinking } = props;

  return (
    <div className="chatbox-constainer">
      {chats.map((data, index) => {
        return (
          <div className="chatbox-wrapper" key={index}>
            <ChatContent
              chat={data}
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
