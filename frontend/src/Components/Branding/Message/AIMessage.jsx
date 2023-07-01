const AIMessage = (props) => {
    return (
        <div>
            <div className="flex flex-col p-2 gap-5">
                <h1 className="border-b-[1px] border-[--site-card-icon-color] font-semibold pb-2">
                    {props.title}
                </h1>
                <div className="flex justify-between gap-3">
                    <div className="flex flex-col gap-2 w-1/3">
                        <span>Background</span>
                        <input
                            type="color"
                            onChange={(e) =>
                                (props.data.ai_bg = e.target.value)
                            }
                            defaultValue={props.data.ai_bg}
                        />
                    </div>
                    <div className="flex flex-col gap-2 w-1/3">
                        <span>Color</span>
                        <input
                            type="color"
                            onChange={(e) =>
                                (props.data.ai_color = e.target.value)
                            }
                            defaultValue={props.data.ai_color}
                        />
                    </div>
                    <div className="flex flex-col gap-2 w-1/3">
                        <span>Size (pixel)</span>
                        <input
                            type="number"
                            className="p-2 rounded-full border-[1px] border-[--site-card-icon-color]"
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
