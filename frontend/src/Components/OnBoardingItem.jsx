import React from "react";
const OnBoardingItem = (props) => {
    const { header, src } = props;

    return (
        <div className="flex w-full h-full flex-col justify-center items-center gap-4">
            <span className="font-bold text-3xl" >{header}</span>
            <div className="w-[750px] h-[550px] overflow-hidden">
                <img src={src} alt="onboarding item" className="-translate-y-20"/>
            </div>
        </div>
    );
};

export default OnBoardingItem;
