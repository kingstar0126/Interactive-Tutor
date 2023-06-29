import { useState } from "react";
import Switch from "../../Switch";

const LogoBranding = (props) => {
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

    const handleLogo = (e) => {
        props.data.url = e.target.value;
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
                        <span>Your logo URL</span>
                        <input
                            defaultValue={props.data.url}
                            onChange={handleLogo}
                            className="w-full rounded-full border-[1px] border-[--site-card-icon-color] p-2"
                        />
                    </div>
                    <div className="flex w-full gap-3">
                        <div className="flex flex-col w-1/2">
                            <span>Height (pixel)</span>
                            <input
                                defaultValue={props.data.height}
                                onChange={(e) => {
                                    props.data.height = e.target.value;
                                }}
                                className="w-full rounded-full p-2 border-[1px] border-[--site-card-icon-color]"
                                type="number"
                            />
                        </div>
                        <div className="flex flex-col w-1/2">
                            <span>Width (pixel)</span>
                            <input
                                onChange={(e) => {
                                    props.data.width = e.target.value;
                                }}
                                defaultValue={props.data.width}
                                className="w-full rounded-full p-2 border-[1px] border-[--site-card-icon-color]"
                                type="number"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LogoBranding;
