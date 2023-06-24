import { useState, useRef, useEffect } from "react";
import PinField from "react-pin-field";
import chatsend from "../assets/chatgpt-send.svg";
import axios from "axios";
import { webAPI } from "../utils/constants";
import { useSelector, useDispatch } from "react-redux";
import { Toaster } from "react-hot-toast";
import { setchatbot, getchatbot } from "../redux/actions/chatAction";
import { useNavigate } from "react-router-dom";
import { Scrollbars } from "react-custom-scrollbars";
import { CodeBlock, dracula } from "react-code-blocks";

const NewChat = () => {
  const navigate = useNavigate();
  const [chathistory, setChathistory] = useState([]);
  const previous_location = useSelector(
    (state) => state.location.previous_location
  );
  const current_location = useSelector(
    (state) => state.location.current_location
  );
  const dispatch = useDispatch();
  const pinFieldRef = useRef(null);
  const checkpinRef = useRef(null);
  const newchat = useRef(null);
  const messagesEndRef = useRef(null);
  const [validate, SetValidate] = useState(false);
  const [error, SetError] = useState(false);
  const [message, setMessage] = useState("");
  const chat = JSON.parse(useSelector((state) => state.chat.chat));
  const chatbot = useSelector((state) => state.chat.chatbot);

  const [separatedString, setseparatedString] = useState([]);

  useEffect(() => {
    if (previous_location !== current_location) {
      console.log("The new chatbot created!!!", chat);
      let new_chat = chat;
      setchatbot(dispatch, new_chat);
      if (new_chat.conversation !== "")
        setChathistory([
          ...chathistory,
          { role: "ai", content: new_chat.conversation },
        ]);
    } else if (!chatbot) {
      navigate(-1);
    } else {
      console.log("The load chatbot!!!");
      let id = chatbot;
      axios.post(webAPI.get_message, { id }).then((res) => {
        console.log(res.data.data);
        setChathistory(res.data.data.message);
      });
    }
  }, []);

  useEffect(() => {
    if (chat.access === 0) {
      checkpinRef.current.classList.add("hidden");
      newchat.current.classList.remove("hidden");
    } else {
      checkpinRef.current.classList.remove("hidden");
      newchat.current.classList.add("hidden");
    }
  }, [chat.access]);

  useEffect(() => {
    messagesEndRef.current.scrollToBottom();
  }, [chathistory]);

  const handleComplete = (value) => {
    console.log(typeof value, typeof chat.access);

    if (chat.access != value) {
      SetError(true);
      pinFieldRef.current.forEach((input) => (input.value = ""));
      pinFieldRef.current[0].focus();
    } else {
      checkpinRef.current.classList.add("hidden");
      newchat.current.classList.remove("hidden");
    }
  };

  const handleSubmit = (event) => {
    if (event.keyCode === 13) {
      let id = chatbot;
      let _message = message;

      setChathistory([...chathistory, { role: "human", content: _message }]);
      sendMessage(id, _message);

      event.preventDefault();
      setMessage("");
    }
  };

  const sendMessage = (id, _message) => {
    axios.post(webAPI.sendchat, { id, _message }).then((res) => {
      if (!res.data.success) console.log("error", res.data.message);
      else {
        console.log(res.data.data);
        receiveMessage(res.data.data);
      }
    });
  };

  const receiveMessage = (message) => {
    setChathistory((prevHistory) => [
      ...prevHistory,
      { role: "ai", content: message },
    ]);
  };

  return (
    <div className="w-full">
      <Toaster />

      <div
        className="flex flex-col py-5 w-full items-center justify-center min-h-[200px]"
        ref={checkpinRef}
      >
        {
          <div className="flex gap-2">
            <PinField
              ref={pinFieldRef}
              name="chatdescription"
              length={4}
              type="password"
              inputMode="numeric"
              onRejectKey={() => {
                SetValidate(true);
              }}
              onResolveKey={() => {
                SetValidate(false);
              }}
              validate="0123456789"
              onComplete={handleComplete}
              className="mb-1 w-[40px] p-[15px] items-center justify-center h-[40px] focus:border-none focus:ring-opacity-40 text-[--site-card-icon-color] focus:outline-none focus:ring focus:border-[--site-main-color4] border rounded-lg hover:border-[--site-main-color5]"
            />
          </div>
        }
        {error && (
          <span className="text-[--site-main-form-error] text-[12px]">
            PIN is incorrect. Please try again!
          </span>
        )}
        {validate && (
          <span className="text-[--site-main-form-error] text-[12px]">
            The PIN must be number
          </span>
        )}
      </div>
      <div
        ref={newchat}
        className="bg-[--site-card-icon-color] w-full px-10 h-[700px] p-5 flex flex-col items-center justify-center"
      >
        <div className="w-2/3 h-full">
          <Scrollbars ref={messagesEndRef}>
            {chathistory.map((data, index) => {
              return data.role === "human" && data.content ? (
                <div
                  name="human"
                  key={index}
                  className="text-[--site-logo-text-color] whitespace-break-spaces w-full flex p-2"
                >
                  <span>{data.content}</span>
                </div>
              ) : data.role === "ai" && data.content ? (
                <div
                  name="ai"
                  key={index}
                  className="text-[--site-main-color3] whitespace-break-spaces w-full flex flex-col p-2"
                >
                  {data.content.split("```").map((item, index) => {
                    if (index === 0 || index % 2 === 0) {
                      return <span key={index}>{item}</span>;
                    } else {
                      return (
                        <CodeBlock
                          key={index}
                          text={item}
                          language={"javascript"}
                          showLineNumbers={false}
                          wrapLongLines={true}
                          theme={dracula}
                          wrapLines
                        />
                      );
                    }
                  })}
                </div>
              ) : null;
            })}
          </Scrollbars>
        </div>

        <div className="flex w-2/3 divide-x-2">
          <input
            type="text"
            id="website-admin"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleSubmit}
            className="rounded-none w-11/12 rounded-l-lg bg-[--site-main-color3] text-[--site-card-icon-color] block text-sm p-2.5 focus:border-[--site-logo-text-color] "
            placeholder="Type message"
          />
          <span className="inline-flex w-1/12 items-center px-3 text-sm text-[--site-card-icon-color] bg-[--site-main-color3] border border-l-0 rounded-r-md">
            <img src={chatsend} alt="send" className="w-auto h-auto" />
          </span>
        </div>
      </div>
    </div>
  );
};

export default NewChat;
