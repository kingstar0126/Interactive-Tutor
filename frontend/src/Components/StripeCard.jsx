import { MdDone } from "react-icons/md";

const StripeCard = (props) => {
  return (
    //     <div className="flex items-center justify-center p-[12px] rounded-xl drop-shadow-lg border border-inherit bg-[--site-main-color3] w-[300px]">
    //       <div className="px-[20px] py-[10px]"></div>
    //       <div className="w-4/5">
    //         <p>{props.title}</p>
    //       </div>
    //       <div className="flex items-center justify-center w-1/5">
    //         <MdDone className="fill-[--site-main-color5] w-5 h-5 pointer-events-none" />
    //       </div>
    //   </div>
    <div className="p-[10px] w-[393px]">
      <div className="flex flex-col items-center justify-center border-2 rounded-xl border-slate-500 p-[24px]">
        <div className="flex container items-center justify-center w-full text-[20px] font-semibold pb-[12px]">
          {/* {props.title} */}
          Basic 🔥
        </div>
        <div className="flex container items-center justify-center w-full pb-[12px] flex-col">
          <div className="flex">
            <span className="text-[30px] font-extrabold static flex">
              <span className="leading-none ">$15</span>
              <span className="text-[15px]">82</span>
            </span>
          </div>
        </div>
        <div className="container flex flex-col items-start justify-center gap-1 pl-2 pb-[12px]">
          <div className="flex items-center justify-center">
            <MdDone className="fill-[--site-main-color7] w-5 h-5 pointer-events-none" />
            {/* {props.data} */}3 chatbots
          </div>
          <div className="flex items-center justify-center">
            <MdDone className="fill-[--site-main-color7] w-5 h-5 pointer-events-none" />
            {/* {props.data} */}3 chatbots
          </div>
          <div className="flex items-center justify-center">
            <MdDone className="fill-[--site-main-color7] w-5 h-5 pointer-events-none" />
            {/* {props.data} */}3 chatbots
          </div>
          <div className="flex items-center justify-center">
            <MdDone className="fill-[--site-main-color7] w-5 h-5 pointer-events-none" />
            {/* {props.data} */}3 chatbots
          </div>
        </div>
        <div className="container flex flex-col items-center justify-center mt-5">
          <button className="text-white rounded-full bg-[--site-main-color4] p-1">
            <span className="px-[14px] h-[24px]">Get Started</span>
          </button>
          <span className="mt-5 text-[12px] flex">No Hidden feeds🎉</span>
        </div>
      </div>
    </div>
  );
};

export default StripeCard;
