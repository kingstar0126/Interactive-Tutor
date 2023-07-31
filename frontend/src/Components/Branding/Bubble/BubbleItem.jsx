import { useState } from "react";
import Switch from "../../Switch";
import Select from "react-select";

const BubbleItem = (props) => {
    const [text, setText] = useState("");
    const [status, setStatus] = useState(
        props.data.pageload === undefined ? true : props.data.pageload
    );

    const change_text = (toggle) => {
        if (!toggle) {
            setText("Enabled");
            setStatus(false);
        } else {
            setText("Disabled");
            setStatus(true);
        }
        props.data.pageload = toggle;
    };

    const handleColor = (e) => {
        props.data.color = e.target.value;
    };
    const handlePosition = (e) => {
        props.data.position = e;
    };

    const customStyles = {
        control: (provided) => ({
            ...provided,
            background: "transparent", // Adjust as needed
        }),
        placeholder: (provided) => ({
            ...provided,
            color: "black", // Replace with your placeholder text color
        }),
        menu: (provided) => ({
            ...provided,
            background:
                "linear-gradient(to bottom right, [--site-main-modal-from-color], [--site-main-modal-to-color])", // Replace with your gradient colors
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.25)", // Replace with your shadow style
        }),
    };

    return (
        <div className="flex flex-col gap-5 border border-[--site-chat-header-border] rounded-lg p-4 h-full">
            <span className="border-b-[1px] border-[--site-card-icon-color] pb-2">
                {props.title}
            </span>
            <div name="content">
                <div className="flex">
                    <div className="flex flex-col w-1/2">
                        <span>Background</span>
                        <input
                            type="color"
                            onChange={handleColor}
                            defaultValue={
                                props.data.color === undefined
                                    ? "#efefef"
                                    : props.data.color
                            }
                            className="w-1/3 my-1 bg-transparent"
                        />
                    </div>
                    <div className="flex flex-col w-1/2 gap-1">
                        <span>Position</span>
                        <Select
                            defaultValue={props.data.position}
                            onChange={handlePosition}
                            options={[
                                { value: 0, label: "Left" },
                                { value: 1, label: "Right" },
                            ]}
                            styles={customStyles}
                        />
                    </div>
                </div>
                <div className="flex">
                    <div name="switch" className="flex flex-col gap-2 mt-5">
                        <span className="font-medium">Open the page load</span>
                        <div className="flex w-full gap-2 font-medium">
                            <Switch
                                handlechange={change_text}
                                toggle={status}
                            />
                            <span>{text}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BubbleItem;
