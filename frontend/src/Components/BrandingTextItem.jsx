import { useState } from "react";
import Switch from "./Switch";

const BrandingTextItem = (props) => {
    const [text, setText] = useState("Disable");
    const [status, setStatus] = useState(
        props.data.status === undefined ? true : props.data.status
    );
    const change_text = (toggle) => {
        if (!toggle) {
            setText("Enabled");
            setStatus(false);
        } else {
            setText("Disabled");
            setStatus(true);
        }
        props.data.status = toggle;
    };

    const handleDescription = (e) => {
        props.data.description = e.target.value;
    };

    const handleColor = (e) => {
        props.data.color = e.target.value;
    };

    const handleSize = (e) => {
        props.data.size = e.target.value;
    };

    return (
        <div className="flex flex-col gap-5 border border-[--site-chat-header-border] rounded-lg p-4">
            <span className="border-b border-[--site-chat-header-border] pb-2">
                {props.title}
            </span>
            <div name="switch" className="flex flex-col gap-2">
                <span className="font-medium">Status</span>
                <div className="flex w-full gap-2 font-medium">
                    <Switch handlechange={change_text} toggle={status} />
                    <span>{text}</span>
                </div>
            </div>
            <div name="input" className="w-full">
                <span>Texts</span>
                <input
                    defaultValue={props.data.description}
                    className="w-full border-[--site-chat-header-border] border bg-transparent px-4 py-2 rounded-md"
                    onChange={handleDescription}
                ></input>
            </div>
            <div name="colorsize" className="flex justify-between w-full">
                <div className="flex flex-col">
                    <span>Color</span>
                    <input
                        type="color"
                        onChange={handleColor}
                        defaultValue={
                            props.data.color === undefined
                                ? "#efefef"
                                : props.data.color
                        }
                        className="my-1 bg-transparent"
                    />
                </div>
                <div name="size" className="flex flex-col w-1/3 gap-1">
                    <span>Size (pixel)</span>
                    <input
                        defaultValue={props.data.size}
                        type="number"
                        onChange={handleSize}
                        className="border-[--site-chat-header-border] border bg-transparent px-4 py-1 rounded-md"
                    />
                </div>
            </div>
        </div>
    );
};

export default BrandingTextItem;
