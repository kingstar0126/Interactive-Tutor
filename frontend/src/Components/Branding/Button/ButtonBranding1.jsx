import { useState } from "react";
import Switch from "../../Switch";

const ButtonBranding1 = (props) => {
    const [text, setText] = useState("Disable");
    const [status, setStatus] = useState(
        props.data.button1_status === undefined
            ? true
            : props.data.button1_status
    );
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
            <div className="flex flex-col w-full gap-5 border border-[--site-chat-header-border] rounded-lg p-4">
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
                <div name="input" className="flex flex-col w-full gap-3 p-2">
                    <div className="w-full">
                        <span>URL</span>
                        <input
                            className="w-full border-[--site-chat-header-border] border bg-transparent px-4 py-2 rounded-md"
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
                            className="w-full border-[--site-chat-header-border] border bg-transparent px-4 py-2 rounded-md"
                        />
                    </div>
                    <div className="flex w-full gap-3">
                        <div className="flex flex-col w-1/3 gap-2 pr-2">
                            <span className="text-[12px] md:text-[16px]">
                                Background
                            </span>
                            <input
                                type="color"
                                onChange={(e) =>
                                    (props.data.button1_bg = e.target.value)
                                }
                                defaultValue={
                                    props.data.button1_bg === undefined
                                        ? "#efefef"
                                        : props.data.button1_bg
                                }
                                className="w-full my-1 bg-transparent  border border-[--site-card-icon-color]"
                            />
                        </div>
                        <div className="flex flex-col w-1/3 gap-2">
                            <span className="text-[12px] md:text-[16px]">
                                Color
                            </span>
                            <input
                                type="color"
                                onChange={(e) =>
                                    (props.data.button1_color = e.target.value)
                                }
                                defaultValue={
                                    props.data.button1_color === undefined
                                        ? "#efefef"
                                        : props.data.button1_color
                                }
                                className="my-1 bg-transparent  border border-[--site-card-icon-color]"
                            />
                        </div>
                        <div className="flex flex-col w-1/3 gap-2">
                            <span className="text-[12px] md:text-[16px]">
                                Size (pixel)
                            </span>
                            <input
                                type="number"
                                defaultValue={props.data.button1_size}
                                onChange={(e) =>
                                    (props.data.button1_size = e.target.value)
                                }
                                className="px-4 py-1 rounded-md border-[1px] border-[--site-chat-header-border] bg-transparent"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ButtonBranding1;
