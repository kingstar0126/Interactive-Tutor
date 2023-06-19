import { useState } from "react";
const Switch = () => {
  const [toggle, setToggle] = useState(true);
  const toggleClass = " transform translate-x-5";

  return (
    <div
      className="flex items-center w-12 h-6 p-1 bg-[--site-main-color3] border border-black rounded-full cursor-pointer md:w-14 md:h-7 bg-transparent"
      onClick={() => {
        setToggle(!toggle);
      }}
    >
      {/* Switch */}
      <div
        className={
          "bg-[--site-main-color4] md:w-6 md:h-6 h-5 w-5 rounded-full shadow-md transform duration-300 ease-in-out" +
          (toggle ? null : toggleClass)
        }
      ></div>
    </div>
  );
};

export default Switch;
