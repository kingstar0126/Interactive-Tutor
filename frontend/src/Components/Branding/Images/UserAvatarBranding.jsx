const UserAvatarBranding = (props) => {
    const handleLogo = (e) => {
        props.data.user = e.target.value;
    };

    return (
        <div>
            <div className="flex flex-col p-2 gap-5">
                <h1 className="border-b-[1px] border-[--site-card-icon-color] font-semibold pb-2">
                    {props.title}
                </h1>
                <div className="flex flex-col gap-2">
                    <span>User avatar URL</span>
                    <input
                        name="input"
                        defaultValue={props.data.user}
                        onChange={handleLogo}
                        className="w-full p-2 rounded-full border-[1px] border-[--site-card-icon-color]"
                    ></input>
                </div>
            </div>
        </div>
    );
};

export default UserAvatarBranding;
