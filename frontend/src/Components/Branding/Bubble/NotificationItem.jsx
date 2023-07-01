import { useEffect, useState } from "react";
import { FcFullTrash, FcPlus } from "react-icons/fc";

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

    const handleAdd = (e) => {
        let { index } = props;
    };

    const handleRemove = (e) => {
        let { index, item } = props;
    };

    return (
        <div className="flex gap-2 px-2 border border-[--site-card-icon-color] rounded-xl">
            <div className="flex flex-col w-full py-3">
                <span>Notification</span>
                <input
                    value={notification}
                    className="rounded-full border-[1px] border-[--site-card-icon-color] p-2 "
                    onChange={handleChange}
                />
            </div>
            {/*<div className="flex flex-col rounded-t-xl rounded-b-xl w-1/12 bg-[--site-main-color6] p-2 justify-center items-center gap-2">
                 <div onClick={handleRemove}>
                    <FcFullTrash className="w-[20px] h-[20px] pointer-events-none" />
                </div>
                <div onClick={handleAdd}>
                    <FcPlus className="w-[20px] h-[20px] pointer-events-none" />
                </div> 
            </div>*/}
        </div>
    );
};

export default NotificationItem;
