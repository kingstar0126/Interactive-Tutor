const BackgroundColor = (props) => {
    return (
        <div>
            <div className="flex flex-col border border-[--site-chat-header-border] rounded-lg p-4 gap-5">
                <span className="border-b border-[--site-chat-header-border] pb-2">
                    {props.title}
                </span>
                <div className="flex justify-start gap-3 mb-3">
                    <div className="flex flex-col gap-2">
                        <span className="text-[12px] md:text-[16px]">
                            Background
                        </span>
                        <input
                            type="color"
                            onChange={(e) => (props.data.bg = e.target.value)}
                            defaultValue={
                                props.data.bg === undefined
                                    ? "#efefef"
                                    : props.data.bg
                            }
                            className="my-1 bg-transparent border border-[--site-card-icon-color]"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BackgroundColor;
