import React from "react";
const OnBoardingItem = (props) => {
    const { header, src } = props;

    return (
        <div className="flex w-full flex-col justify-center items-center gap-4">
            <img
                src={src}
                alt="onboarding item"
                className="w-full max-h-[550px] overflow-hidden max-w-[500px] md:max-w-[700px] object-cover"
            />
        </div>
    );
};

export default OnBoardingItem;
