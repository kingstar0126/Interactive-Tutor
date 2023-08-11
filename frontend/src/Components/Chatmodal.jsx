import { useState, useEffect } from "react";
import {
    Accordion,
    AccordionHeader,
    AccordionBody,
    DialogHeader,
    Dialog,
    DialogBody,
    DialogFooter,
} from "@material-tailwind/react";
import Select from "react-select";
import { useSelector } from "react-redux";
import { RiArrowDownSLine, RiArrowUpSLine } from "react-icons/ri";
import { Scrollbar } from "react-scrollbars-custom";

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
    const [behaviormodel, SetBehaviormodel] = useState(
        `If there is relevant training data available, please utilize it to generate responses using the provided information. However, if no training data exists, you must respond with "I don't know." and Do not respond with anything except 'I don't know.'`
    );
    const [behavior, SetBehavior] = useState("You are a helpful assistant");

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
            SetBehaviormodel(
                `If there is relevant training data available, please utilize it to generate responses using the provided information. However, if no training data exists, you must respond with "I don't know."`
            );
            SetBehavior("You are a helpful assistant");
        }
        if (props.chat && props.chat.label) {
            SetLabel(props.chat["label"]);
            SetChatdescription(props.chat["description"]);
            setOpen(0);
            SetConversation(props.chat["conversation"]);
            SetChatmodel(props.chat["model"]);
            SetCreativity(props.chat["creativity"]);
            SetBehaviormodel(props.chat["behaviormodel"]);
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
                behaviormodel,
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
            new_chat["behaviormodel"] = behaviormodel;
            new_chat["behavior"] = behavior;
            props.handleOk(new_chat);
        }
    };

    const handleOpen = (value) => {
        setOpen(open === value ? 0 : value);
    };

    const Icon = ({ id, open }) => {
        return id === open ? <RiArrowUpSLine /> : <RiArrowDownSLine />;
    };

    const customStyles = {
        control: (provided) => ({
            ...provided,
            background: "transparent", // Adjust as needed
        }),
        placeholder: (provided) => ({
            ...provided,
            color: "black", // Replace with your placeholder text color
        }),
        menu: (provided) => ({
            ...provided,
            background:
                "linear-gradient(to bottom right, [--site-main-modal-from-color], [--site-main-modal-to-color])", // Replace with your gradient colors
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.25)", // Replace with your shadow style
        }),
    };

    return (
        <Dialog
            open={props.open}
            size={"lg"}
            handler={props.handleCancel}
            className="border-[--site-chat-header-border] border rounded-2xl from-[--site-main-modal-from-color] to-[--site-main-modal-to-color] bg-gradient-to-br shadow-lg shadow-[--site-card-icon-color]"
        >
            <DialogHeader className="px-8 pt-8 pb-6">
                <span className="text-[32px] leading-12 font-semibold text-[--site-card-icon-color]">
                    Chat
                </span>
            </DialogHeader>
            <DialogBody className="border-t border-[--site-main-modal-divide-color] text-black text-base font-medium pl-8 pt-6 h-[30rem]">
                <Scrollbar>
                    <div className="mr-4">
                        <div className="flex flex-col items-start gap-2">
                            <label>Label (Private)</label>
                            <input
                                type="text"
                                name="label"
                                value={label}
                                onChange={(e) => {
                                    SetLabel(e.target.value);
                                }}
                                autocomplete="off"
                                placeholder="AI-Tutor name"
                                className="w-full h-10 px-5 py-3 bg-transparent border-[--site-main-modal-input-border-color] border rounded-md placeholder:text-black/60 placeholder:opacity-50"
                            />
                            <p>
                                The label is used to identify your AI Tutor.
                                It's private and exclusively visible to you.
                            </p>
                            {!label && (
                                <p className="text-[12px] mb-2 text-[--site-main-form-error]">
                                    * Label (Private) is required
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col items-start gap-2 mt-6">
                            <label>Description (Private)</label>
                            <input
                                type="text"
                                name="chatdescription"
                                value={chatdescription}
                                onChange={(e) => {
                                    SetChatdescription(e.target.value);
                                }}
                                autocomplete="off"
                                placeholder="This is my general assistant"
                                className="w-full h-10 px-5 py-3 bg-transparent border-[--site-main-modal-input-border-color] border rounded-md placeholder:text-black/60 placeholder:opacity-50"
                            />
                            <p>
                                The description is used to identify your AI
                                Tutor. It's private and exclusively visible to
                                you.
                            </p>
                        </div>

                        <div className="flex flex-col items-start p-5 mt-6 rounded-md border border-[--site-main-modal-input-border-color]">
                            <Accordion
                                open={open === 1}
                                icon={<Icon id={1} open={open} />}
                            >
                                <AccordionHeader
                                    onClick={() => handleOpen(1)}
                                    className="border-0"
                                >
                                    <p className="text-base font-medium text-black">
                                        Models (LLMs)
                                    </p>
                                </AccordionHeader>
                                <AccordionBody className="border-t border-[--site-main-modal-input-border-color]">
                                    <div className="flex flex-col items-start gap-2 text-black">
                                        <label>Model</label>
                                        <select
                                            name="chatdescription"
                                            value={chatmodel}
                                            onChange={(e) => {
                                                SetChatmodel(e.target.value);
                                            }}
                                            className="w-full h-10 px-5 py-3 bg-transparent border-[--site-main-modal-input-border-color] border rounded-md placeholder:text-black placeholder:opacity-50"
                                        >
                                            {gptmodel.map((item) => {
                                                return (
                                                    <option
                                                        key={item.value}
                                                        value={item.value}
                                                    >
                                                        {item.label}
                                                    </option>
                                                );
                                            })}
                                        </select>
                                        <p>
                                            The description is used to identify
                                            your AI Tutor. It's private and
                                            exclusively visible to you.
                                        </p>
                                    </div>
                                </AccordionBody>
                            </Accordion>
                        </div>
                        <div className="flex flex-col items-start p-5 mt-6 rounded-md border border-[--site-main-modal-input-border-color]">
                            <Accordion
                                open={open === 2}
                                icon={<Icon id={2} open={open} />}
                            >
                                <AccordionHeader
                                    onClick={() => handleOpen(2)}
                                    className="border-0"
                                >
                                    <p className="text-base font-medium text-black">
                                        Conversation Starter
                                    </p>
                                </AccordionHeader>
                                <AccordionBody className="border-t border-[--site-main-modal-input-border-color]">
                                    <div className="flex flex-col items-start gap-2 text-black">
                                        <label>Welcome message</label>
                                        <textarea
                                            name="chatdescription"
                                            rows="5"
                                            cols="50"
                                            value={Conversation}
                                            onChange={(e) => {
                                                SetConversation(e.target.value);
                                            }}
                                            placeholder="Hello friends! How can I help you today?"
                                            className="w-full h-10 px-5 py-3 bg-transparent border-[--site-main-modal-input-border-color] border rounded-md placeholder:text-black"
                                        ></textarea>
                                        <p>
                                            The description is used to identify
                                            your AI Tutor. It's private and
                                            exclusively visible to you.
                                        </p>
                                    </div>
                                </AccordionBody>
                            </Accordion>
                        </div>
                        <div className="flex flex-col items-start p-5 mt-6 rounded-md border border-[--site-main-modal-input-border-color]">
                            <Accordion
                                open={open === 3}
                                icon={<Icon id={3} open={open} />}
                            >
                                <AccordionHeader
                                    onClick={() => handleOpen(3)}
                                    className="border-0"
                                >
                                    <p className="text-base font-medium text-black">
                                        Advanced settings - Behavior
                                        configuration
                                    </p>
                                </AccordionHeader>
                                <AccordionBody className="border-t border-[--site-main-modal-input-border-color] gap-5 flex-col flex h-full">
                                    <div className="flex flex-col items-start gap-2 text-black">
                                        <label>
                                            Context behavior (Required)
                                        </label>
                                        <Select
                                            placeholder="Hello friends! How can I help you today?"
                                            styles={customStyles}
                                            className="w-full border-[--site-main-modal-input-border-color] border rounded-md"
                                            isSearchable={false}
                                            onChange={(e) => {
                                                SetBehaviormodel(e.label);
                                            }}
                                            defaultValue={{
                                                value: "1",
                                                label: `Given contextual information from training data, generate responses using training information as much as possible. If no training data is available, respond with "I don't know"`,
                                            }}
                                            options={[
                                                {
                                                    value: "1",
                                                    label: `If there is relevant training data available, please utilize it to generate responses using the provided information. However, if no training data exists, you must respond with "I don't know."`,
                                                },
                                                {
                                                    value: "2",
                                                    label: `Utilize contextual knowledge to provide an informed response. Leverage patterns learned from data to carry out the task at hand.`,
                                                },
                                                {
                                                    value: "3",
                                                    label: `Behave like the default ChatGPT`,
                                                },
                                            ]}
                                        />
                                        <p>
                                            The context behavior determines how
                                            the training data you provide will
                                            be utilized. It specifies the way in
                                            which the AI Tutor understands and
                                            responds to user inputs based on the
                                            given context.
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-start gap-2 text-black">
                                        <label>Behavior prompt</label>
                                        <textarea
                                            name="chatdescription"
                                            rows="3"
                                            cols="50"
                                            value={behavior}
                                            onChange={(e) => {
                                                SetBehavior(e.target.value);
                                            }}
                                            placeholder="You are a helpful assistant"
                                            className="w-full h-10 px-5 py-3 bg-transparent border-[--site-main-modal-input-border-color] border rounded-md placeholder:text-black"
                                        ></textarea>
                                        <p>
                                            The behavior prompt overrides our
                                            default behavior of 'You are a
                                            helpful assistant' to provide a more
                                            customized experience, allowing your
                                            AI Tutor to act in a manner that
                                            aligns with your specific
                                            requirements and preferences.
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-start gap-2 text-black">
                                        <label>
                                            Creativity ({Creativity}) -
                                            Recommended value : 0.3
                                        </label>
                                        <input
                                            type="range"
                                            min={0}
                                            max={1}
                                            step={0.1}
                                            onChange={(e) => {
                                                SetCreativity(e.target.value);
                                            }}
                                            defaultValue={0.3}
                                            className="w-full h-2 mb-2 bg-[--site-main-modal-input-border-color]"
                                        />
                                        <p>
                                            Creativity can be adjusted by
                                            changing the temperature value. A
                                            higher temperature value, such as
                                            0.7, can result in more
                                            unpredictable and diverse outputs,
                                            while a lower temperature value,
                                            such as 0.2, can produce a more
                                            precise and specific output.
                                        </p>
                                    </div>
                                </AccordionBody>
                            </Accordion>
                        </div>
                    </div>
                </Scrollbar>
            </DialogBody>
            <DialogFooter className="flex items-center justify-end gap-4 px-10 pb-8">
                <button
                    onClick={props.handleCancel}
                    className="bg-transparent border-[--site-card-icon-color] text-[--site-card-icon-color] text-base font-semibold border rounded-md px-4 py-2"
                >
                    cancel
                </button>
                {label && (
                    <button
                        onClick={onOK}
                        className="px-4 py-2 text-base font-semibold text-white bg-[--site-card-icon-color] rounded-md"
                    >
                        confirm
                    </button>
                )}
                {!label && (
                    <button
                        disabled
                        onClick={onOK}
                        className="px-4 py-2 text-base font-semibold text-white bg-[--site-card-icon-color] rounded-md disabled:opacity-75"
                    >
                        confirm
                    </button>
                )}
            </DialogFooter>
        </Dialog>
    );
};

export default Chatmodal;
