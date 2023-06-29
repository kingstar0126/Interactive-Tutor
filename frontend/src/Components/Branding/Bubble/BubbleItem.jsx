import { useEffect, useState } from "react";
import Switch from "../../Switch";
import Select from "react-select";

const BubbleItem = (props) => {
    const [text, setText] = useState("");
    const [status, setStatus] = useState(props.data.pageload);

    const change_text = (toggle) => {
        if (!toggle) {
            setText("Enabled");
            setStatus(false);
        } else {
            setText("Disabled");
            setStatus(true);
        }
        console.log(toggle);
        props.data.pageload = toggle;
    };

    const handleColor = (e) => {
        console.log(e.target.value);
        console.log(props.data);
        props.data.color = e.target.value;
    };
    const handlePosition = (e) => {
        props.data.position = e;
    };

    return (
        <div className="flex flex-col p-2 gap-5">
            <h1 className="border-b-[1px] border-[--site-card-icon-color] font-semibold pb-2">
                {props.title}
            </h1>
            <div name="content">
                <div className="flex">
                    <div className="flex flex-col w-1/2">
                        <span>Background</span>
                        <input
                            type="color"
                            onChange={handleColor}
                            defaultValue={props.data.color}
                        />
                    </div>
                    <div className="w-1/2">
                        <span>Position</span>
                        <Select
                            defaultValue={props.data.position}
                            onChange={handlePosition}
                            options={[
                                { value: 0, label: "Left" },
                                { value: 1, label: "Right" },
                            ]}
                        />
                    </div>
                </div>
                <div className="flex">
                    <div
                        name="switch"
                        className="gap-2 flex flex-col mt-5 w-1/2"
                    >
                        <span className="font-medium">Open the page load</span>
                        <div className="flex gap-2 w-full font-medium">
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
