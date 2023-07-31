import { useEffect, useState } from "react";
import Switch from "../../Switch";
import NotificationItem from "./NotificationItem";

const NotificationBubble = (props) => {
    const [text, setText] = useState("");
    const [status, setStatus] = useState(true);
    const [data, setData] = useState(["Hello! How can I help you? 😊"]);

    const change_text = (toggle) => {
        if (!toggle) {
            setText("Enabled");
            setStatus(false);
        } else {
            setText("Disabled");
            setStatus(true);
        }
        props.data.notification = toggle;
    };

    const handleAddNotification = async (index) => {
        const newData = [...data];
        newData.splice(index + 1, 0, "");
        setData([...newData]);
    };

    const handleRemoveNotification = (index, _item) => {
        const newData = [...data];
        if (newData.length > 1) {
            newData.splice(index, 1);
            setData(newData);
        }
    };

    const handleChangeItem = (item, index) => {
        const newData = [...data];
        newData[index] = item;
        setData(newData);
        props.data.data = data;
    };

    return (
        <div className="flex flex-col gap-5 border border-[--site-chat-header-border] rounded-lg p-4 h-full">
            <h1 className="border-b-[1px] border-[--site-card-icon-color] font-semibold pb-2">
                {props.title}
            </h1>
            <div name="switch" className="flex flex-col gap-2">
                <span className="font-medium">Status</span>
                <div className="flex w-full gap-2 font-medium">
                    <Switch handlechange={change_text} toggle={status} />
                    <span>{text}</span>
                </div>
                {data.map((item, index) => {
                    return (
                        <NotificationItem
                            index={index}
                            item={item}
                            key={index}
                            handleChangeItem={handleChangeItem}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default NotificationBubble;
