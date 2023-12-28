import { useEffect, useState } from "react";

const Switch = (props) => {
    const [toggle, setToggle] = useState(props.toggle);
    const toggleClass = " transform translate-x-5";

    useEffect(() => {
        props.handlechange && props.handlechange(toggle);
    }, [toggle]);

    useEffect(() => {
        if (props.toggle) {
            setToggle(props.toggle);
        }
    }, []);
    return (
        <div
            className={
                "flex items-center w-12 h-6 p-1 border border-white rounded-full cursor-pointer md:w-14 md:h-7 " +
                (toggle
                    ? "bg-gray-400"
                    : "bg-[--site-card-icon-color]")
            }
            onClick={() => {
                setToggle(!toggle);
            }}
        >
            {/* Switch */}
            <div
                className={
                    "bg-[--site-main-color1] md:w-6 md:h-6 h-5 w-5 rounded-full shadow-md transform duration-300 ease-in-out" +
                    (toggle ? null : toggleClass)
                }
            ></div>
        </div>
    );
};

export default Switch;
