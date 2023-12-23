const BackgroundColor = (props) => {
    return (
        <div className="flex flex-col border border-[--site-chat-header-border] rounded-lg p-4 gap-5 h-full">
            <h1 className="border-b-[1px] border-[--site-card-icon-color] font-semibold pb-2">
                {props.title}
            </h1>

            <div className="flex flex-col gap-2">
                <span className="text-[12px] md:text-[16px]">Background</span>

                <input
                    type="color"
                    onChange={(e) => (props.data.bg = e.target.value)}
                    defaultValue={
                        props.data.bg === undefined ? "#efefef" : props.data.bg
                    }
                    className="my-1"
                />
            </div>
        </div>
    );
};

export default BackgroundColor;
