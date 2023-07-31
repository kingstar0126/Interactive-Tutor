import { useEffect, useState } from "react";

const NotificationItem = (props) => {
    const [notification, setNotification] = useState("");
    useEffect(() => {
        setNotification(props.item);
    }, []);
    const handleChange = (e) => {
        setNotification(e.target.value);
        let { index } = props;
        props.handleChangeItem(e.target.value, index);
    };

    return (
        <div className="px-2 border border-[--site-chat-header-border] rounded-xl mt-2">
            <div className="flex flex-col w-full gap-2 p-2 py-3">
                <span>Notification</span>
                <input
                    value={notification}
                    className="rounded-md border border-[--site-chat-header-border] bg-transparent px-4 py-2 "
                    onChange={handleChange}
                />
            </div>
        </div>
    );
};

export default NotificationItem;
