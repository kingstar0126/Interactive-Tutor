const AIMessage = (props) => {
    return (
        <div>
            <div className="flex flex-col border border-[--site-chat-header-border] rounded-lg p-4 gap-5">
                <span className="border-b border-[--site-chat-header-border] pb-2">
                    {props.title}
                </span>
                <div className="flex justify-between gap-3">
                    <div className="flex flex-col w-1/3 gap-2">
                        <span className="text-[12px] md:text-[16px]">
                            Background
                        </span>
                        <input
                            type="color"
                            onChange={(e) =>
                                (props.data.ai_bg = e.target.value)
                            }
                            defaultValue={
                                props.data.ai_bg === undefined
                                    ? "#efefef"
                                    : props.data.ai_bg
                            }
                            className="my-1 bg-transparent"
                        />
                    </div>
                    <div className="flex flex-col w-1/3 gap-2">
                        <span className="text-[12px] md:text-[16px]">
                            Color
                        </span>
                        <input
                            type="color"
                            onChange={(e) =>
                                (props.data.ai_color = e.target.value)
                            }
                            defaultValue={
                                props.data.ai_color === undefined
                                    ? "#efefef"
                                    : props.data.ai_color
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
                            className="p-2 rounded-md bg-transparent border border-[--site-chat-header-border]"
                            onChange={(e) =>
                                (props.data.ai_size = e.target.value)
                            }
                            defaultValue={props.data.ai_size}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIMessage;
