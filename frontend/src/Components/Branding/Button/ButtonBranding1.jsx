import { useState } from "react";
import Switch from "../../Switch";

const ButtonBranding1 = (props) => {
    const [text, setText] = useState("Disable");
    const [status, setStatus] = useState(props.data.button1_status);

    const change_text = (toggle) => {
        if (!toggle) {
            setText("Enabled");
            setStatus(false);
        } else {
            setText("Disabled");
            setStatus(true);
        }
        props.data.button1_status = toggle;
    };

    return (
        <div>
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
                <div name="input" className="w-full flex flex-col gap-3 p-2">
                    <div className="w-full">
                        <span>URL</span>
                        <input
                            className="w-full rounded-full border-[1px] border-[--site-card-icon-color] p-2"
                            onChange={(e) =>
                                (props.data.button1_url = e.target.value)
                            }
                            defaultValue={props.data.button1_url}
                        />
                    </div>
                    <div className="w-full">
                        <span>Text</span>
                        <input
                            defaultValue={props.data.button1_text}
                            onChange={(e) =>
                                (props.data.button1_text = e.target.value)
                            }
                            className="w-full rounded-full border-[1px] border-[--site-card-icon-color] p-2"
                        />
                    </div>
                    <div className="flex justify-between gap-3">
                        <div className="flex flex-col gap-2 w-1/3">
                            <span>Background</span>
                            <input
                                type="color"
                                defaultValue={props.data.button1_bg}
                                onChange={(e) =>
                                    (props.data.button1_bg = e.target.value)
                                }
                            />
                        </div>
                        <div className="flex flex-col gap-2 w-1/3">
                            <span>Color</span>
                            <input
                                type="color"
                                defaultValue={props.data.button1_color}
                                onChange={(e) =>
                                    (props.data.button1_color = e.target.value)
                                }
                            />
                        </div>
                        <div className="flex flex-col gap-2 w-1/3">
                            <span>Size (pixel)</span>
                            <input
                                type="number"
                                defaultValue={props.data.button1_size}
                                onChange={(e) =>
                                    (props.data.button1_size = e.target.value)
                                }
                                className="p-2 rounded-full border-[1px] border-[--site-card-icon-color]"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ButtonBranding1;
