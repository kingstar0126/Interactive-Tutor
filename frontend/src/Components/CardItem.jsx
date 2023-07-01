import { MdOutlineAddCircle } from "react-icons/md";

const Card = (props) => {
  return (
    <div className="flex items-center justify-center p-[12px] rounded-xl drop-shadow-lg border border-inherit bg-[--site-main-color3] w-[300px]">
      <div className="px-[20px] py-[10px]"></div>
      <div className="w-4/5">
        <p>{props.title}</p>
      </div>
      <div className="flex items-center justify-center w-1/5">
        <MdOutlineAddCircle className="fill-[--site-main-color5] w-5 h-5 pointer-events-none" />
      </div>
    </div>
  );
};

export default Card;
