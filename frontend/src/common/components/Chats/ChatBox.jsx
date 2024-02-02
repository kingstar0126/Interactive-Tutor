import "./styles.scss";
import ChatContent from "./ChatContent";

const ChatBox = (props) => {
    const { chats, isStreamData } = props;

    return (
        <div className="chatbox-constainer">
            {chats.map((data, index) => {
                return (
                    <div className="chatbox-wrapper" key={index}>
                        <ChatContent chat={data} keys={index} isStreamData={isStreamData} />
                    </div>
                )
            })}
        </div>
    );
};

export default ChatBox;
