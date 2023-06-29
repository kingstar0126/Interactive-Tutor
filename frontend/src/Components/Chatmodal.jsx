import { useState, useEffect } from "react";
import {
  Accordion,
  AccordionHeader,
  AccordionBody,
} from "@material-tailwind/react";
import { PinField } from "react-pin-field";
import Select from "react-select";

const Chatmodal = (props) => {
  const [label, SetLabel] = useState("");
  const [chatdescription, SetChatdescription] = useState(
    "This is my general assistant"
  );
  const [chatmodel, SetChatmodel] = useState("GPT 3.5 | 4K context");
  const [open, setOpen] = useState(0);
  const [Conversation, SetConversation] = useState(
    "Hello friends! How can I help you today?"
  );
  const [validate, SetValidate] = useState(false);
  const [Creativity, SetCreativity] = useState(0.3);
  const [access, SetAccess] = useState(0);
  const [behaviormodel, SetBehaviormodel] =
    useState(`Utilize contextual information from the training
  data, and if necessary, respond with 'I don't know'
  when appropriate.(The chatbot will search the
  training data for a response and provide an answer
  only if a matching response is found.)`);
  const [behavior, SetBehavior] = useState("You are a helpful assistant");

  useEffect(() => {
    if (!props.chat) {
      SetLabel("");
      SetChatdescription("");
      SetChatmodel("GPT 3.5 | 4K context");
      setOpen(0);
      SetConversation("Hello friends! How can I help you today?");
      SetValidate(false);
      SetCreativity(0.3);
      SetAccess(0);
      SetBehaviormodel(`Utilize contextual information from the training
    data, and if necessary, respond with 'I don't know'
    when appropriate.(The chatbot will search the
    training data for a response and provide an answer
    only if a matching response is found.)`);
      SetBehavior("You are a helpful assistant");
    }
    if (props.chat && props.chat.label) {
      SetLabel(props.chat["label"]);
      SetChatdescription(props.chat["description"]);
      SetChatmodel(props.chat["model"]);
      setOpen(0);
      SetConversation(props.chat["conversation"]);
      SetValidate(false);
      SetCreativity(props.chat["creativity"]);
      SetAccess(props.chat["access"]);
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
        access,
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
      new_chat["access"] = access;
      new_chat["creativity"] = Creativity;
      new_chat["behaviormodel"] = behaviormodel;
      new_chat["behavior"] = behavior;
      props.handleOk(new_chat);
    }
  };
  const handleComplete = (value) => {
    SetAccess(value);
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
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
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
                placeholder="Chatbot name"
                className="mb-1 w-full focus:border-none focus:ring-opacity-40 focus:outline-none p-1 focus:ring focus:border-[--site-main-color4] h-10 border rounded-lg hover:border-[--site-main-color5] text-[--site-card-icon-color]"
              />
              <p className="text-sm text-[--site-main-color5]">
                The label is used to identify your chatbot. It's private and
                exclusively visible to you.
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
                onChange={(e) => {
                  SetChatdescription(e.target.value);
                }}
                placeholder="This is my general assistant"
                className="mb-1 w-full focus:border-none focus:ring-opacity-40 focus:outline-none p-1 focus:ring focus:border-[--site-main-color4] h-10 border rounded-lg hover:border-[--site-main-color5] text-[--site-card-icon-color]"
              />
              <p className="text-sm text-[--site-main-color5]">
                The description is used to identify your chatbot. It's private
                and exclusively visible to you.
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
                      <p className="text-[16px] font-normal">Models (LLMs)</p>
                    </div>
                  </AccordionHeader>
                  <AccordionBody className="p-2 border-t">
                    <div className="flex flex-col items-start py-2">
                      <label className="mb-1 text-sm font-semibold">
                        Model
                      </label>
                      <select
                        name="chatdescription"
                        value={chatmodel}
                        onChange={(e) => SetChatmodel(e.target.value)}
                        className="mb-1 w-full focus:border-none focus:ring-opacity-40 focus:outline-none p-1 focus:ring focus:border-[--site-main-color4] h-10 border rounded-lg hover:border-[--site-main-color5] text-[--site-card-icon-color]"
                      >
                        <option value="1" className="py-1">
                          GPT 3.5 | 4K context
                        </option>
                        <option value="2" className="py-1">
                          GPT 3.5 | 16K context
                        </option>
                        <option value="3" className="py-1">
                          GPT 4 | 4K context
                        </option>
                      </select>
                      <p className="text-sm text-[--site-main-color5]">
                        The description is used to identify your chatbot. It's
                        private and exclusively visible to you.
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
                      <label className="mb-1 text-sm font-semibold ">
                        Welcome message
                      </label>
                      <textarea
                        name="chatdescription"
                        rows="3"
                        cols="50"
                        value={Conversation}
                        onChange={(e) => {
                          SetConversation(e.target.value);
                        }}
                        placeholder="Hello friends! How can I help you today?"
                        className="mb-1 w-full focus:border-none focus:ring-opacity-40 focus:outline-none p-1 focus:ring focus:border-[--site-main-color4] border rounded-lg hover:border-[--site-main-color5] text-[--site-card-icon-color]"
                      ></textarea>
                      <p className="text-sm text-[--site-main-color5]">
                        The description is used to identify your chatbot. It's
                        private and exclusively visible to you.
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
                      <p className="text-[16px] font-normal">Access control</p>
                    </div>
                  </AccordionHeader>
                  <AccordionBody className="p-2 border-t">
                    <div className="flex flex-col items-start py-2">
                      <label className="mb-1 text-sm font-semibold">
                        PIN protection
                      </label>
                      <div className="flex flex-row gap-2">
                        <PinField
                          name="chatdescription"
                          length={4}
                          inputMode="numeric"
                          onRejectKey={() => {
                            SetValidate(true);
                          }}
                          onResolveKey={() => {
                            SetValidate(false);
                          }}
                          validate="0123456789"
                          onComplete={handleComplete}
                          className="mb-1 w-[40px] h-[40px] focus:border-none focus:ring-opacity-40 text-[--site-card-icon-color] focus:outline-none p-[15px] focus:ring focus:border-[--site-main-color4] border rounded-lg hover:border-[--site-main-color5]"
                        />
                      </div>
                      {validate && (
                        <span className="text-[--site-main-form-error] text-[12px]">
                          The PIN must be number
                        </span>
                      )}
                      <p className="text-sm text-[--site-main-color5] text-start">
                        Utilizing a PIN will enhance the security of your
                        chatbot URL by adding an additional layer of protection,
                        ensuring that only authorized users with the correct PIN
                        can access it. This helps safeguard the information and
                        functionality provided by the widget, offering an extra
                        level of control and privacy.
                      </p>
                    </div>
                  </AccordionBody>
                </Accordion>
              </div>
              <div>
                <Accordion
                  open={open === 4}
                  icon={<Icon id={4} open={open} />}
                  className="p-5 border rounded-lg"
                >
                  <AccordionHeader
                    onClick={() => handleOpen(4)}
                    className="border-[--site-card-icon-color]"
                  >
                    <div className="flex items-start w-4/5">
                      <p className="text-[16px] font-normal">
                        Advanced settings - Behavior configuration
                      </p>
                    </div>
                  </AccordionHeader>
                  <AccordionBody className="p-2 border-t">
                    <div className="flex flex-col items-start py-2">
                      <label className="mb-1 text-sm font-semibold">
                        Context behavior (Required)
                      </label>
                      <Select
                        className="w-full mb-1 text-[--site-card-icon-color]"
                        onChange={(e) => {
                          console.log(e);
                          SetBehaviormodel(e.label);
                        }}
                        defaultValue={{
                          value: "1",
                          label:
                            "Utilize contextual information from the Training data, and if there isn't suitable data say 'I don't know'",
                        }}
                        options={[
                          {
                            value: "1",
                            label:
                              "Utilize contextual information from the training data, and if necessary, respond with 'I don't know' when appropriate.",
                          },
                          {
                            value: "2",
                            label:
                              "Utilize contextual information from the training data and refrain from using the phrase 'I don't know'",
                          },
                          {
                            value: "3",
                            label: `Behave like the default ChatGPT`,
                          },
                        ]}
                      />
                      <p className="text-sm text-[--site-main-color5] text-start">
                        The context behavior determines how the training data
                        you provide will be utilized. It specifies the way in
                        which the chatbot understands and responds to user
                        inputs based on the given context.
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
                        placeholder="You are a helpful assistant"
                        className="mb-1 w-full focus:border-none focus:ring-opacity-40 focus:outline-none p-1 focus:ring focus:border-[--site-main-color4] border rounded-lg hover:border-[--site-main-color5] text-[--site-card-icon-color]"
                      ></textarea>
                      <p className="text-sm text-[--site-main-color5] text-start">
                        The behavior prompt overrides our default behavior of
                        'You are a helpful assistant' to provide a more
                        customized experience, allowing your chatbot to act in a
                        manner that aligns with your specific requirements and
                        preferences.
                      </p>
                    </div>
                    <div className="flex flex-col items-start py-2">
                      <label className="mb-1 text-sm font-semibold">
                        Creativity ({Creativity}) - Recommended value : 0.3
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
                        className="w-full h-2 mb-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-300"
                      />
                      <p className="text-sm text-[--site-main-color5] text-start">
                        Creativity can be adjusted by changing the temperature
                        value. A higher temperature value, such as 0.7, can
                        result in more unpredictable and diverse outputs, while
                        a lower temperature value, such as 0.2, can produce a
                        more precise and specific output.
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
