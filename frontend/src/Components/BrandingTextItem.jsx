import { useState } from "react";
import Switch from "./Switch";

const BrandingTextItem = (props) => {
    const [text, setText] = useState("Disable");
    const [status, setStatus] = useState(props.data.status);

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
        <div className="flex flex-col p-2 gap-5">
            <h1 className="border-b-[1px] border-[--site-card-icon-color] font-semibold pb-2">
                {props.title}
            </h1>
            <div name="switch" className="gap-2">
                <span className="font-medium">Status</span>
                <div className="flex gap-2 w-full font-medium">
                    <Switch handlechange={change_text} toggle={status} />
                    <span>{text}</span>
                </div>
            </div>
            <div name="input" className="w-full">
                <span>Text</span>
                <input
                    defaultValue={props.data.description}
                    className="w-full rounded-full border-[--site-card-icon-color] border border-[1px]m p-2"
                    onChange={handleDescription}
                ></input>
            </div>
            <div name="colorsize" className="w-full flex justify-between">
                <div className="flex flex-col">
                    <span>Color</span>
                    <input
                        type="color"
                        onChange={handleColor}
                        defaultValue={props.data.color}
                    />
                </div>
                <div name="size" className="flex flex-col w-1/3">
                    <span>Size (pixel)</span>
                    <input
                        defaultValue={props.data.size}
                        type="number"
                        onChange={handleSize}
                        className="border-[1px] border-[--site-card-icon-color] rounded-full p-2"
                    />
                </div>
            </div>
        </div>
    );
};

export default BrandingTextItem;
