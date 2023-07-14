import { useEffect } from "react";
import NewChat from "./NewChat";

const EmbeddingChat = () => {
    useEffect(() => {
        localStorage.removeItem("chat");
    }, []);
    return <NewChat />;
};

export default EmbeddingChat;
