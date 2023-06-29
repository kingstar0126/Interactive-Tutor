import { useEffect, useRef, useState } from "react";

const Embedded = (props) => {
    const [chatwindow, setChatwindow] = useState("");
    const [bubble, setBubble] = useState("");
    const chatbot_window = useRef(null);
    const chatbot_bubble = useRef(null);
    const showHideClassname = props.open
        ? "fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto"
        : "hidden";

    useEffect(() => {
        setChatwindow(
            `<iframe style="border: 0" frameborder="0" scrolling="no" height="100%" width="100%" src="http://192.168.103.63:3000/chat/embedding/${props.data.uuid}"></iframe>`
        );
        setBubble(
            `<script type="text/javascript">window.$icg=[];window.ICG_WIDGET_ID="${props.data.uuid}";(function(){d=document;s=d.createElement("script");s.src="http://192.168.103.63:3000/widget/bubble.js";s.async=1;d.getElementsByTagName("head")[0].appendChild(s);})();</script>`
        );
    }, []);

    return (
        <div className={showHideClassname}>
            <div className="relative w-3/5 h-auto text-white p-5 mx-auto rounded-md shadow-lg top-10 bg-[--site-card-icon-color]">
                <div className="mt-3 divide-y text-start">
                    <h3 className="text-lg font-medium leading-6">
                        Add provider
                    </h3>
                    <div className="py-3 mt-5 px-7">
                        <div className="flex flex-col items-center justify-center w-full my-5">
                            <div
                                name="Window embedding"
                                className="border-[1px] items-start gap-5 justify-center border-[--site-main-color3] rounded-xl w-full p-5 flex flex-col"
                            >
                                <h3 className="border-b-[1px] border-[--site-main-color3] py-5 w-full">
                                    Embed as an iframe
                                </h3>
                                <div className="flex flex-col w-full">
                                    <span>Embed everywhere you want</span>
                                    <textarea
                                        ref={chatbot_window}
                                        rows={4}
                                        cols={40}
                                        defaultValue={chatwindow}
                                        className="w-full rounded-xl text-[--site-card-icon-color] p-2"
                                    />
                                </div>
                                <button
                                    className="bg-[--site-logo-text-color] text-[--site-card-icon-color] p-2 rounded-xl"
                                    onClick={() => {
                                        chatbot_window.current.select();
                                        document.execCommand("copy");
                                    }}
                                >
                                    Copy to clipboard
                                </button>
                            </div>
                            <div
                                name="bubble embedding"
                                className="border-[1px] border-[--site-card-icon-color] p-2"
                            ></div>
                        </div>

                        <div className="flex flex-col items-center justify-center w-full my-5">
                            <div
                                name="Window embedding"
                                className="border-[1px] items-start gap-5 justify-center border-[--site-main-color3] rounded-xl w-full p-5 flex flex-col"
                            >
                                <h3 className="border-b-[1px] border-[--site-main-color3] py-5 w-full">
                                    Embed as a chat bubble
                                </h3>
                                <div className="flex flex-col w-full">
                                    <span>Add it in the HTML head section</span>
                                    <textarea
                                        ref={chatbot_bubble}
                                        rows={5}
                                        cols={40}
                                        defaultValue={bubble}
                                        className="w-full rounded-xl text-[--site-card-icon-color] p-2"
                                    />
                                </div>
                                <button
                                    className="bg-[--site-logo-text-color] text-[--site-card-icon-color] p-2 rounded-xl"
                                    onClick={() => {
                                        chatbot_bubble.current.select();
                                        document.execCommand("copy");
                                    }}
                                >
                                    Copy to clipboard
                                </button>
                            </div>
                            <div
                                name="bubble embedding"
                                className="border-[1px] border-[--site-card-icon-color] p-2"
                            ></div>
                        </div>
                    </div>
                    <div className="flex items-center justify-between px-4 py-3">
                        <button
                            onClick={props.handleCancel}
                            className="w-auto px-4 py-2 text-base font-medium text-black border bg-[--site-main-color3] rounded-md shadow-sm hover:bg-[--site-main-color8] focus:outline-none focus:ring-2 focus:ring-green-300"
                        >
                            cancel
                        </button>
                        <button
                            onClick={props.handleOk}
                            className="w-auto px-4 py-2 text-base font-medium text-white bg-[--site-main-form-success1] border rounded-md shadow-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300"
                        >
                            confirm
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Embedded;
