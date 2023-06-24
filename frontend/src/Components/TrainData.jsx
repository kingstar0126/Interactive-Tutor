import { CircleStackIcon } from "@heroicons/react/24/solid";
import { useState } from "react";
import ChatmodalTrain from "./ChatmodalTrain";
import {
  Card,
  CardHeader,
  Typography,
  Button,
  CardBody,
  Chip,
  CardFooter,
} from "@material-tailwind/react";

const TABLE_HEAD = ["Label", "Type", "Status", "action"];

const TABLE_ROWS = [
  {
    img: "",
    name: "John Michael",
    email: "john@creative-tim.com",
    job: "Manager",
    org: "Organization",
    status: true,
  },
  {
    img: "",
    name: "Alexa Liras",
    email: "alexa@creative-tim.com",
    job: "Programator",
    org: "Developer",
    status: false,
  },
  {
    img: "",
    name: "Laurent Perrier",
    email: "laurent@creative-tim.com",
    job: "Executive",
    org: "Projects",
    status: false,
  },
  {
    img: "",
    name: "Michael Levi",
    email: "michael@creative-tim.com",
    job: "Programator",
    org: "Developer",
    status: true,
  },
  {
    img: "",
    name: "Richard Gran",
    email: "richard@creative-tim.com",
    job: "Manager",
    org: "Executive",
    status: false,
  },
];

export default function Example() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = (data) => {
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="h-full w-full">
      <Card>
        <CardHeader floated={false} shadow={false} className="rounded-none">
          <div className="mb-8 flex items-center justify-end">
            <div className="flex shrink-0 flex-col gap-2 sm:flex-row bg-[--site-card-icon-color] rounded-xl mr-5">
              <Button
                className="flex items-center gap-3"
                color="blue"
                onClick={showModal}
                size="sm"
              >
                <CircleStackIcon
                  strokeWidth={2}
                  className="h-4 w-4 pointer-events-none"
                />{" "}
                Add member
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardBody className="px-0 w-full h-full">
          <table className="mt-4 w-full min-w-max table-auto text-left">
            <thead>
              <tr>
                {TABLE_HEAD.map((head) => (
                  <th key={head} className="p-4 border-b-[1px]">
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-bold leading-none opacity-70 text-center"
                    >
                      {head}
                    </Typography>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TABLE_ROWS.map(({ name, job, org, status }, index) => {
                const isLast = index === TABLE_ROWS.length - 1;
                const classes = isLast
                  ? "p-4"
                  : "p-4 border-b border-blue-gray-50";

                return (
                  <tr key={name} className="text-center">
                    <td className={classes}>
                      <div className="flex flex-col">
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal"
                        >
                          {name}
                        </Typography>
                      </div>
                    </td>
                    <td className={classes}>
                      <div className="flex flex-col">
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal"
                        >
                          {job}
                        </Typography>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal opacity-70"
                        >
                          {org}
                        </Typography>
                      </div>
                    </td>
                    <td className={classes}>
                      <div className="w-full flex justify-center">
                        {status === true && (
                          <Chip
                            className="text-center w-2/5 bg-[--site-success-text-color]"
                            value={status ? "online" : "offline"}
                          />
                        )}
                        {status === false && (
                          <Chip
                            className="text-center w-2/5 bg-[--site-warning-text-color]"
                            value={status ? "online" : "offline"}
                          />
                        )}
                      </div>
                    </td>
                    <td className={classes}>
                      <div className="flex gap-2 w-full justify-center">
                        <span
                          onClick={() => {}}
                          className="w-1/3 text-[--site-card-icon-color] text-center text-[14px] bg-[--site-logo-text-color] hover:border-[--site-card-icon-color] border rounded-full active:bg-[--site-main-color4] select-none active:text-white"
                        >
                          Edit
                        </span>
                        <span className="text-[--site-card-icon-color] w-1/3 text-[14px] text-center hover:bg-[--site-main-form-error] border-[--site-main-form-error] hover:text-white border rounded-full active:bg-[--site-main-form-error1] select-none active:text-white">
                          Delete
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardBody>
        <CardFooter className="flex items-center justify-between border-t border-blue-gray-50 p-4">
          <Typography variant="small" color="blue-gray" className="font-normal">
            Page 1 of 10
          </Typography>
          <div className="flex gap-2">
            <Button variant="outlined" color="blue-gray" size="sm">
              Previous
            </Button>
            <Button variant="outlined" color="blue-gray" size="sm">
              Next
            </Button>
          </div>
        </CardFooter>
      </Card>
      <ChatmodalTrain
        open={isModalOpen}
        handleOk={handleOk}
        handleCancel={handleCancel}
      />
    </div>
  );
}
