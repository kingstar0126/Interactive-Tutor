import { useState, useEffect } from "react";
import {
  Dialog,
  DialogBody,
  DialogFooter,
  Button,
} from "@material-tailwind/react";
import Select from "react-select";
import { Scrollbar } from "react-scrollbars-custom";
import toast, { Toaster } from "react-hot-toast";

const ROLES = [
  "Administrative and Management",
  "Specialist and Technical",
  "Pupil Support and Welfare",
  "Teaching and Learning Support",
  "Extracurricular Activities and Clubs",
  "Health and Safety",
  "Parent and Community Involvement",
];
const SUBJECTS = [
  "English",
  "Mathematics",
  "Science (Biology, Chemistry, Physics)",
  "History",
  "Modern Foreign Languages (e.g., French, Spanish, German, Mandarin)",
  "Classical Languages (e.g., Latin, Greek)",
  "Art",
  "Music",
  "Drama",
  "Design and Technology",
  "Computer Science",
  "Business Studies",
  "Physical Education",
  "Health Education",
  "Special Education",
  "Theologoy, Philosophy & Religious Education",
  "Home Economics",
];

const TASKS = [
  "Educational Delivery",
  "Student Engagement",
  "Assessment and Records",
  "Communication and Development",
  "Technology Integration",
  "Strategic Operations",
  "Policy and Community",
  "Facilities and Safety",
  "Curriculum and Staff Oversight",
  "Data and Analysis",
];

const FUNS = ["Historical Charachters", "Image Generation", "Games", "Misc"];

const PublishModal = (props) => {
  const [chat, setChat] = useState(null);
  const [label, setLabel] = useState("");
  const [chatdescription, setChatdescription] = useState("");
  const [role, setRole] = useState(null);
  const [subject, setSubject] = useState(null);
  const [task, setTask] = useState(null);
  const [fun, setFun] = useState(null);

  useEffect(() => {
    if (props.chat.access) {
      setChat(props.chat);
      setLabel(props.chat.label);
      setChatdescription(props.chat.description);
    }
  }, [props.chat]);

  const notification = (type, message) => {
    // To do in here
    if (type === "error") {
      toast.error(message);
    }
    if (type === "success") {
      toast.success(message);
    }
  };

  const handleOk = () => {
    if (!label || !chatdescription || role === null || subject === null || task === null || fun === null ) {
      notification('error', 'Please select all fileds')
      return;
    }
    chat.label = label;
    chat.description = chatdescription;
    chat.role = role
    chat.subject = subject
    chat.task = task
    chat.fun = fun
    props.handleOk(chat);

  };

  return (
    <Dialog
      open={props.open}
      size={"lg"}
      handler={props.handleCancel}
      className=" border-[--site-chat-header-border] border rounded-md"
    >
      <Toaster />
      <DialogBody className="border-t border-[--site-main-modal-divide-color] text-black text-base font-medium h-[25rem] md:hidden">
        <Scrollbar>
          {chat && (
            <div className="flex flex-col gap-4">
              <div className="flex justify-center items-center w-full">
                <img
                  src={
                    chat.chat_logo.url ? chat.chat_logo.url : chat.chat_logo.ai
                  }
                  alt="Tutor"
                  className="rounded-md max-h-[150px]"
                />
              </div>
              <div className="flex flex-col items-start gap-2">
                <label className=" text-base font-semibold">Label</label>
                <input
                  type="text"
                  name="label"
                  value={label}
                  onChange={(e) => {
                    setLabel(e.target.value);
                  }}
                  autoComplete="off"
                  placeholder="AI-Tutor name"
                  className="w-full h-10 px-5 py-3 bg-transparent border-[--site-onboarding-primary-color] border rounded-md placeholder:text-black/60 placeholder:opacity-50"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className=" text-base font-semibold">Description</label>
                <input
                  type="text"
                  value={chatdescription}
                  onChange={(e) => {
                    setChatdescription(e.target.value);
                  }}
                  autoComplete="off"
                  placeholder="This is my general assistant"
                  className="w-full h-10 px-5 py-3 bg-transparent border-[--site-onboarding-primary-color] border rounded-md placeholder:text-black/60 placeholder:opacity-50"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className=" text-base font-semibold">
                  Select the Category
                </label>
                <div className="flex gap-4 md:flex-row flex-col">
                  <Select
                    onChange={(e) => setRole(e.value)}
                    className="rounded-md md:w-1/4 border border-[--site-onboarding-primary-color]"
                    placeholder="Role"
                    options={ROLES.map((item, id) => {
                      return { label: item, value: id };
                    })}
                  />

                  <Select
                    onChange={(e) => setSubject(e.value)}
                    className="rounded-md md:w-1/4 border border-[--site-onboarding-primary-color]"
                    placeholder="Subject"
                    options={SUBJECTS.map((item, id) => {
                      return { label: item, value: id };
                    })}
                  />

                  <Select
                    onChange={(e) => setTask(e.value)}
                    className="rounded-md md:w-1/4 border border-[--site-onboarding-primary-color]"
                    placeholder="Task"
                    options={TASKS.map((item, id) => {
                      return { label: item, value: id };
                    })}
                  />
                  <Select
                    onChange={(e) => setFun(e.value)}
                    className="rounded-md md:w-1/4 border border-[--site-onboarding-primary-color]"
                    placeholder="Just For Fun"
                    options={FUNS.map((item, id) => {
                      return { label: item, value: id };
                    })}
                  />
                </div>
              </div>
            </div>
          )}
        </Scrollbar>
      </DialogBody>
      <DialogBody className="border-t border-[--site-main-modal-divide-color] text-black text-base font-medium hidden md:block p-5">
        {chat && (
          <div className="flex flex-col gap-4 px-5">
            <div className="flex justify-center items-center w-full">
              <img
                src={
                  chat.chat_logo.url ? chat.chat_logo.url : chat.chat_logo.ai
                }
                alt="Tutor"
                className="rounded-md max-h-[150px]"
              />
            </div>
            <div className="flex flex-col items-start gap-2">
              <label className=" text-base font-semibold">Label</label>
              <input
                type="text"
                name="label"
                value={label}
                onChange={(e) => {
                  setLabel(e.target.value);
                }}
                autoComplete="off"
                placeholder="AI-Tutor name"
                className="w-full h-10 px-5 py-3 bg-transparent border-[--site-onboarding-primary-color] border rounded-md placeholder:text-black/60 placeholder:opacity-50"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className=" text-base font-semibold">Description</label>
              <input
                type="text"
                value={chatdescription}
                onChange={(e) => {
                  setChatdescription(e.target.value);
                }}
                autoComplete="off"
                placeholder="This is my general assistant"
                className="w-full h-10 px-5 py-3 bg-transparent border-[--site-onboarding-primary-color] border rounded-md placeholder:text-black/60 placeholder:opacity-50"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className=" text-base font-semibold">
                Select the Category
              </label>
              <div className="flex gap-4 md:flex-row flex-col">
                <Select
                  onChange={(e) => setRole(e.value)}
                  className="rounded-md md:w-1/4 border border-[--site-onboarding-primary-color]"
                  placeholder="Role"
                  options={ROLES.map((item, id) => {
                    return { label: item, value: id };
                  })}
                />

                <Select
                  onChange={(e) => setSubject(e.value)}
                  className="rounded-md md:w-1/4 border border-[--site-onboarding-primary-color]"
                  placeholder="Subject"
                  options={SUBJECTS.map((item, id) => {
                    return { label: item, value: id };
                  })}
                />

                <Select
                  onChange={(e) => setTask(e.value)}
                  className="rounded-md md:w-1/4 border border-[--site-onboarding-primary-color]"
                  placeholder="Task"
                  options={TASKS.map((item, id) => {
                    return { label: item, value: id };
                  })}
                />
                <Select
                  onChange={(e) => setFun(e.value)}
                  className="rounded-md md:w-1/4 border border-[--site-onboarding-primary-color]"
                  placeholder="Just For Fun"
                  options={FUNS.map((item, id) => {
                    return { label: item, value: id };
                  })}
                />
              </div>
            </div>
          </div>
        )}
      </DialogBody>
      <DialogFooter className="flex items-center justify-between gap-4 px-10 pb-8">
        <div className="flex gap-4 justify-end w-full">
          <Button
            onClick={props.handleCancel}
            className=" normal-case bg-transparent border-[--site-onboarding-primary-color] text-[--site-onboarding-primary-color] text-base font-semibold border rounded-md px-4 py-2"
          >
            cancel
          </Button>

          <Button
            onClick={() => handleOk()}
            className=" normal-case px-4 py-2 text-base font-semibold text-white bg-[--site-onboarding-primary-color] rounded-md disabled:opacity-75"
          >
            Publish
          </Button>
        </div>
      </DialogFooter>
    </Dialog>
  );
};

export default PublishModal;
