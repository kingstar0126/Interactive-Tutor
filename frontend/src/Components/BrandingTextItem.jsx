import { useState } from "react";
import Switch from "./Switch";

const BrandingTextItem = (props) => {
  const [text, setText] = useState("Disable");
  const [status, setStatus] = useState(
    props.data.status === undefined ? true : props.data.status
  );
  const change_text = (toggle) => {
    if (!toggle) {
      setText("Enabled");
      setStatus(false);
    } else {
      setText("Disabled");
      setStatus(true);
    }
    props.data.status = toggle;
  };

  const handleDescription = (e) => {
    props.data.description = e.target.value;
  };

  const handleColor = (e) => {
    props.data.color = e.target.value;
  };

  const handleSize = (e) => {
    props.data.size = e.target.value;
  };

  return (
    <div className="flex flex-col gap-5 border border-[--site-chat-header-border] rounded-lg p-4">
      <h1 className="border-b-[1px] border-[--site-card-icon-color] font-semibold pb-2">
        {props.title}
      </h1>
      <div name="switch" className="flex flex-col gap-2">
        <span className="font-medium">Status</span>
        <div className="flex w-full gap-2 font-medium">
          <Switch handlechange={change_text} toggle={status} />
          <span>{text}</span>
        </div>
      </div>
      <div name="input" className="w-full">
        <span>Texts</span>
        <input
          defaultValue={props.data.description}
          className="w-full border-[--site-chat-header-border] border bg-transparent px-4 py-2 rounded-md"
          onChange={handleDescription}
        ></input>
      </div>

      <div className="flex flex-col w-full">
        <span>Color</span>
        <input
          type="color"
          onChange={handleColor}
          defaultValue={
            props.data.color === undefined ? "#efefef" : props.data.color
          }
          className={`my-1 w-2/3 bg-transparent ${
            /chrome/i.test(navigator.userAgent)
              ? ""
              : "border border-[--site-card-icon-color]"
          }`}
        />
      </div>
      <div name="size" className="flex flex-col w-full gap-1">
        <span>Size (pixel)</span>
        <input
          defaultValue={props.data.size}
          type="number"
          onChange={handleSize}
          className="border-[--site-chat-header-border] border bg-transparent px-4 py-1 rounded-md"
        />
      </div>
    </div>
  );
};

export default BrandingTextItem;
