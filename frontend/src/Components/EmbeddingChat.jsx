import { useEffect } from "react";
import NewChat from "./NewChat";

const EmbeddingChat = () => {
  useEffect(() => {
    sessionStorage.removeItem("chat");
  }, []);
  return <NewChat />;
};

export default EmbeddingChat;
