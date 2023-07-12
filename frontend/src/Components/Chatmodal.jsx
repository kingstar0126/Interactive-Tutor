import { useState, useEffect } from "react";
import {
    Accordion,
    AccordionHeader,
    AccordionBody,
} from "@material-tailwind/react";
import Select from "react-select";
import { useSelector } from "react-redux";

const Chatmodal = (props) => {
    const [label, SetLabel] = useState("");
    const user = JSON.parse(useSelector((state) => state.user.user));
    const [chatdescription, SetChatdescription] = useState(
        "This is my general assistant"
    );
    const [chatmodel, SetChatmodel] = useState("1");
    const [open, setOpen] = useState(0);
    const [Conversation, SetConversation] = useState(
        "Hello friends! How can I help you today?"
    );
    const models = [
        {
            value: "1",
            label: "GPT 3.5 | 4K context",
        },
        {
            value: "2",
            label: "GPT 3.5 | 16K context",
        },
        {
            value: "3",
            label: "GPT 4 | 4K context",
        },
    ];
    const [gptmodel, SetGPTmodel] = useState(models);
    const [Creativity, SetCreativity] = useState(0.3);
    const [behaviormodel, SetBehaviormodel] = useState({
        value: "1",
        label: `Utilize contextual information from the training
  data, and if necessary, respond with 'I don't know'
  when appropriate.`,
    });
    const [behavior, SetBehavior] = useState("You are a helpful assistant");
    const options = [
        {
            value: "1",
            label: "Utilize contextual information from the training data, and if necessary, respond with 'I don't know' when appropriate.",
        },
        {
            value: "2",
            label: "Utilize contextual information from the training data and refrain from using the phrase 'I don't know'",
        },
        {
            value: "3",
            label: `Behave like the default ChatGPT`,
        },
    ];
    useEffect(() => {
        if (user.role === 2 || user.role === 5) {
            SetGPTmodel([models[0]]);
        } else if (user.role === 3) {
            SetGPTmodel(models.slice(0, 2));
        } else if (user.role === 4) {
            SetGPTmodel(models);
        }

        if (!props.chat) {
            SetLabel("");
            SetChatdescription("");
            setOpen(0);
            SetConversation("Hello friends! How can I help you today?");
            SetCreativity(0.3);
            SetBehaviormodel({
                value: "1",
                label: `Utilize contextual information from the training
          data, and if necessary, respond with 'I don't know'
          when appropriate.`,
            });
            SetBehavior("You are a helpful assistant");
        }
        if (props.chat && props.chat.label) {
            SetLabel(props.chat["label"]);
            SetChatdescription(props.chat["description"]);
            setOpen(0);
            SetConversation(props.chat["conversation"]);
            SetCreativity(props.chat["creativity"]);
            SetBehaviormodel(
                options.find(
                    (item) => item.label === props.chat["behaviormodel"]
                )
            );
            SetBehavior(props.chat["behavior"]);
        }
    }, [props.open, props.chat]);

    const onOK = () => {
        if (!props.chat) {
            props.handleOk({
                label,
                chatdescription,
                chatmodel,
                Conversation,
                Creativity,
                behaviormodel: behaviormodel.label,
                behavior,
            });
        }
        if (props.chat && props.chat.label) {
            let new_chat = props.chat;
            new_chat["label"] = label;
            new_chat["description"] = chatdescription;
            new_chat["model"] = chatmodel;
            new_chat["conversation"] = Conversation;
            new_chat["creativity"] = Creativity;
            new_chat["behaviormodel"] = behaviormodel.label;
            new_chat["behavior"] = behavior;
            props.handleOk(new_chat);
        }
    };

    const handleOpen = (value) => {
        setOpen(open === value ? 0 : value);
    };

    const Icon = ({ id, open }) => {
        return (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`${
                    id === open ? "rotate-180" : ""
                } h-5 w-5 transition-transform`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                />
            </svg>
        );
    };

    const showHideClassname = props.open
        ? "fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full"
        : "hidden";
    return (
        <div className={showHideClassname}>
            <div className="relative w-3/5 p-5 mx-auto bg-[--site-card-icon-color] text-white rounded-md shadow-lg top-10">
                <div className="mt-3 text-center divide-y">
                    <h3 className="text-lg font-medium leading-6">Chat</h3>
                    <div className="py-3 mt-2 px-7">
                        <div className="flex flex-col items-start py-2">
                            <label className="mb-1 text-sm font-semibold">
                                Label (Private)
                            </label>
                            <input
                                type="text"
                                name="label"
                                value={label}
                                onChange={(e) => {
                                    SetLabel(e.target.value);
                                }}
                                placeholder="AI-Tutor name"
                                className="mb-1 w-full focus:border-none focus:ring-opacity-40 focus:outline-none p-1 focus:ring focus:border-[--site-main-color4] h-10 border rounded-lg hover:border-[--site-main-color5] text-[--site-card-icon-color]"
                            />
                            <p className="text-sm text-[--site-main-color5]">
                                The label is used to identify your AI Tutor.
                                It's private and exclusively visible to you.
                            </p>
                            {!label && (
                                <p className="text-[12px] text-[--site-main-form-error]">
                                    * Label (Private) is required
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col items-start py-2">
                            <label className="mb-1 text-sm font-semibold ">
                                Description (Private)
                            </label>
                            <input
                                type="text"
                                name="chatdescription"
                                value={chatdescription}
                                maxLength={255}
                                onChange={(e) => {
                                    SetChatdescription(e.target.value);
                                }}
                                placeholder="This is my general assistant"
                                className="mb-1 w-full focus:border-none focus:ring-opacity-40 focus:outline-none p-1 focus:ring focus:border-[--site-main-color4] h-10 border rounded-lg hover:border-[--site-main-color5] text-[--site-card-icon-color]"
                            />
                            <p className="text-sm text-[--site-main-color5]">
                                The description is used to identify your AI
                                Tutor. It's private and exclusively visible to
                                you.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3">
                            <div>
                                <Accordion
                                    open={open === 1}
                                    icon={<Icon id={1} open={open} />}
                                    className="p-5 border rounded-lg"
                                >
                                    <AccordionHeader
                                        onClick={() => handleOpen(1)}
                                        className="border-[--site-card-icon-color]"
                                    >
                                        <div className="flex items-start w-4/5">
                                            <p className="text-[16px] font-normal">
                                                Models (LLMs)
                                            </p>
                                        </div>
                                    </AccordionHeader>
                                    <AccordionBody className="p-2 border-t">
                                        <div className="flex flex-col items-start py-2">
                                            <label className="mb-1 text-sm font-semibold text-[--site-main-color3]">
                                                Model
                                            </label>
                                            <select
                                                name="chatdescription"
                                                onChange={(e) => {
                                                    SetChatmodel(
                                                        e.target.value
                                                    );
                                                }}
                                                className="mb-1 w-full focus:border-none focus:ring-opacity-40 focus:outline-none p-1 focus:ring focus:border-[--site-main-color4] h-10 border rounded-lg hover:border-[--site-main-color5] text-[--site-card-icon-color]"
                                            >
                                                {gptmodel.map((item, index) => {
                                                    return (
                                                        <option
                                                            key={index}
                                                            value={item.value}
                                                        >
                                                            {item.label}
                                                        </option>
                                                    );
                                                })}
                                            </select>

                                            <p className="text-sm text-[--site-main-color5]">
                                                The description is used to
                                                identify your AI Tutor. It's
                                                private and exclusively visible
                                                to you.
                                            </p>
                                        </div>
                                    </AccordionBody>
                                </Accordion>
                            </div>
                            <div>
                                <Accordion
                                    open={open === 2}
                                    icon={<Icon id={2} open={open} />}
                                    className="p-5 border rounded-lg"
                                >
                                    <AccordionHeader
                                        onClick={() => handleOpen(2)}
                                        className="border-[--site-card-icon-color]"
                                    >
                                        <div className="flex items-start w-4/5">
                                            <p className="text-[16px] font-normal">
                                                Conversation Starter
                                            </p>
                                        </div>
                                    </AccordionHeader>
                                    <AccordionBody className="p-2 border-t">
                                        <div className="flex flex-col items-start py-2">
                                            <label className="mb-1 text-sm font-semibold text-[--site-main-color3]">
                                                Welcome message
                                            </label>
                                            <textarea
                                                name="chatdescription"
                                                rows="3"
                                                cols="50"
                                                maxLength={255}
                                                value={Conversation}
                                                onChange={(e) => {
                                                    SetConversation(
                                                        e.target.value
                                                    );
                                                }}
                                                placeholder="Hello friends! How can I help you today?"
                                                className="mb-1 w-full focus:border-none focus:ring-opacity-40 focus:outline-none p-1 focus:ring focus:border-[--site-main-color4] border rounded-lg hover:border-[--site-main-color5] text-[--site-card-icon-color]"
                                            ></textarea>
                                            <p className="text-sm text-[--site-main-color5]">
                                                The description is used to
                                                identify your AI Tutor. It's
                                                private and exclusively visible
                                                to you.
                                            </p>
                                        </div>
                                    </AccordionBody>
                                </Accordion>
                            </div>
                            <div>
                                <Accordion
                                    open={open === 3}
                                    icon={<Icon id={3} open={open} />}
                                    className="p-5 border rounded-lg"
                                >
                                    <AccordionHeader
                                        onClick={() => handleOpen(3)}
                                        className="border-[--site-card-icon-color]"
                                    >
                                        <div className="flex items-start w-4/5">
                                            <p className="text-[16px] font-normal">
                                                Advanced settings - Behavior
                                                configuration
                                            </p>
                                        </div>
                                    </AccordionHeader>
                                    <AccordionBody className="p-2 border-t text-[--site-main-color3]">
                                        <div className="flex flex-col items-start py-2">
                                            <label className="mb-1 text-sm font-semibold">
                                                Context behavior (Required)
                                            </label>
                                            <Select
                                                className="w-full mb-1 text-[--site-card-icon-color]"
                                                onChange={(e) => {
                                                    SetBehaviormodel(e);
                                                }}
                                                defaultValue={behaviormodel}
                                                options={options}
                                            />
                                            <p className="text-sm text-[--site-main-color5] text-start">
                                                The context behavior determines
                                                how the training data you
                                                provide will be utilized. It
                                                specifies the way in which the
                                                AI Tutor understands and
                                                responds to user inputs based on
                                                the given context.
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-start py-2">
                                            <label className="mb-1 text-sm font-semibold ">
                                                Behavior prompt
                                            </label>
                                            <textarea
                                                name="chatdescription"
                                                rows="3"
                                                cols="50"
                                                value={behavior}
                                                onChange={(e) => {
                                                    SetBehavior(e.target.value);
                                                }}
                                                maxLength={250}
                                                placeholder="You are a helpful assistant"
                                                className="mb-1 w-full focus:border-none focus:ring-opacity-40 focus:outline-none p-1 focus:ring focus:border-[--site-main-color4] border rounded-lg hover:border-[--site-main-color5] text-[--site-card-icon-color]"
                                            ></textarea>
                                            <p className="text-sm text-[--site-main-color5] text-start">
                                                The behavior prompt overrides
                                                our default behavior of 'You are
                                                a helpful assistant' to provide
                                                a more customized experience,
                                                allowing your AI Tutor to act in
                                                a manner that aligns with your
                                                specific requirements and
                                                preferences.
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-start py-2">
                                            <label className="mb-1 text-sm font-semibold">
                                                Creativity ({Creativity}) -
                                                Recommended value : 0.3
                                            </label>
                                            <input
                                                type="range"
                                                min={0}
                                                max={1}
                                                step={0.1}
                                                onChange={(e) => {
                                                    SetCreativity(
                                                        e.target.value
                                                    );
                                                }}
                                                defaultValue={0.3}
                                                className="w-full h-2 mb-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-300"
                                            />
                                            <p className="text-sm text-[--site-main-color5] text-start">
                                                Creativity can be adjusted by
                                                changing the temperature value.
                                                A higher temperature value, such
                                                as 0.7, can result in more
                                                unpredictable and diverse
                                                outputs, while a lower
                                                temperature value, such as 0.2,
                                                can produce a more precise and
                                                specific output.
                                            </p>
                                        </div>
                                    </AccordionBody>
                                </Accordion>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-between px-4 py-3">
                        <button
                            onClick={props.handleCancel}
                            className="w-auto px-4 py-2 text-base text-[--site-card-icon-color] font-semibold border bg-[--site-main-color3] rounded-md shadow-sm hover:scale-[105%] focus:outline-none focus:ring-2 focus:ring-green-300"
                        >
                            cancel
                        </button>
                        {label && (
                            <button
                                onClick={onOK}
                                className="w-auto px-4 py-2 text-[--site-card-icon-color] bg-[--site-logo-text-color] border rounded-md shadow-sm hover:scale-[105%] focus:outline-none focus:ring-2 focus:ring-green-300 font-semibold"
                            >
                                confirm
                            </button>
                        )}
                        {!label && (
                            <button
                                disabled
                                onClick={onOK}
                                className="w-auto px-4 py-2 disabled:text-[--site-card-icon-color] font-medium text-white bg-[--site-logo-text-color] border rounded-md shadow-sm disabled:opacity-75"
                            >
                                confirm
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Chatmodal;
