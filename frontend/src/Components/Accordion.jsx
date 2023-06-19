import { Fragment, useState } from "react";
import { MdOutlineAddCircle, MdOutlineRemoveCircle } from "react-icons/md";
import {
  Accordion,
  AccordionHeader,
  AccordionBody,
} from "@material-tailwind/react";

export default function AccordionComponent(props) {
  const [open, setOpen] = useState(0);

  const handleOpen = (value) => {
    setOpen(open === value ? 0 : value);
  };

  return (
    <Fragment>
      <Accordion open={open === 1} className="p-5 border rounded-lg">
        <AccordionHeader onClick={() => handleOpen(1)}>
          <div className="w-4/5">
            <p>{props.title}</p>
          </div>
          <div className="flex items-center justify-center w-1/5">
            {open === 0 ? (
              <MdOutlineAddCircle className="fill-[--site-main-color5] w-5 h-5 pointer-events-none" />
            ) : (
              <MdOutlineRemoveCircle className="fill-[--site-main-color5] w-5 h-5 pointer-events-none" />
            )}
          </div>
        </AccordionHeader>
        <AccordionBody className="p-2">{props.body}</AccordionBody>
      </Accordion>
    </Fragment>
  );
}
