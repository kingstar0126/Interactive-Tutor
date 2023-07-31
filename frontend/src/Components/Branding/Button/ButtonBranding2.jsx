import { useState } from "react";
import Switch from "../../Switch";

const ButtonBranding2 = (props) => {
    const [text, setText] = useState("Disable");
    const [status, setStatus] = useState(
        props.data.button2_status === undefined
            ? true
            : props.data.button2_status
    );

    const change_text = (toggle) => {
        if (!toggle) {
            setText("Enabled");
            setStatus(false);
        } else {
            setText("Disabled");
            setStatus(true);
        }
        props.data.button2_status = toggle;
    };

    return (
        <div>
            <div className="flex flex-col border border-[--site-chat-header-border] rounded-lg p-4 gap-5">
                <h1 className="border-b-[1px] border-[--site-chat-header-border] font-semibold pb-2">
                    {props.title}
                </h1>
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
                                (props.data.button2_url = e.target.value)
                            }
                            defaultValue={props.data.button2_url}
                        />
                    </div>
                    <div className="w-full">
                        <span>Text</span>
                        <input
                            defaultValue={props.data.button2_text}
                            onChange={(e) =>
                                (props.data.button2_text = e.target.value)
                            }
                            className="w-full border-[--site-chat-header-border] border bg-transparent px-4 py-2 rounded-md"
                        />
                    </div>
                    <div className="flex justify-between gap-3">
                        <div className="flex flex-col w-1/3 gap-2 pr-2">
                            <span className="text-[12px] md:text-[16px]">
                                Background
                            </span>
                            <input
                                type="color"
                                onChange={(e) =>
                                    (props.data.button2_bg = e.target.value)
                                }
                                defaultValue={
                                    props.data.button2_bg === undefined
                                        ? "#efefef"
                                        : props.data.button2_bg
                                }
                                className="w-full my-1 bg-transparent"
                            />
                        </div>
                        <div className="flex flex-col w-1/3 gap-2">
                            <span className="text-[12px] md:text-[16px]">
                                Color
                            </span>
                            <input
                                type="color"
                                onChange={(e) =>
                                    (props.data.button2_color = e.target.value)
                                }
                                defaultValue={
                                    props.data.button2_color === undefined
                                        ? "#efefef"
                                        : props.data.button2_color
                                }
                                className="my-1 bg-transparent"
                            />
                        </div>
                        <div className="flex flex-col w-1/3 gap-2">
                            <span className="text-[12px] md:text-[16px]">
                                Size (pixel)
                            </span>
                            <input
                                type="number"
                                defaultValue={props.data.button2_size}
                                onChange={(e) =>
                                    (props.data.button2_size = e.target.value)
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

export default ButtonBranding2;
