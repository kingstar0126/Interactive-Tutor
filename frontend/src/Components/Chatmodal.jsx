import { useState, useEffect } from "react";
import {
    Accordion,
    AccordionHeader,
    AccordionBody,
    DialogHeader,
    Dialog,
    DialogBody,
    DialogFooter,
    Spinner,
    Button,
} from "@material-tailwind/react";
import Select from "react-select";
import { useSelector } from "react-redux";
import { RiArrowDownSLine, RiArrowUpSLine } from "react-icons/ri";
import { Scrollbar } from "react-scrollbars-custom";
import { Link } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import { webAPI } from "../utils/constants";

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
    const [type, setType] = useState(false);
    const [role, setRole] = useState('');
    const [loading, setLoading] = useState(false);
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
            label: "GPT 4 | 8K context",
        },
    ];
    const behaviorModelTheme = [
        {
            value: "1",
            label: `Prioritise the training data, use it to generate responses. However, if no answer can be found in the training data, respond with "I don't know".`,
        },
        {
            value: "2",
            label: `Leverage patterns learned from the training data to generate responses.`,
        },
        {
            value: "3",
            label: `Remove training data ring fencing and perform like ChatGPT`,
        }
    ]
    // const [gptmodel, SetGPTmodel] = useState(models);
    const [Creativity, SetCreativity] = useState(0.3);
    const [selected, setSelected] = useState(0)
    const [behaviormodel, SetBehaviormodel] = useState(
        behaviorModelTheme[0].label
    );
    const [behavior, SetBehavior] = useState("You are a helpful assistant");
    const TutorThemes = [
        {
            title: 'Report Writer',
            prompt: `The Report Writing Tutor is designed to assist teachers in generating personalized reports on their students. To initiate a session, the AI should start by asking for the name of the student. The AI should then inquire if there are any specific events or details the teacher would like to include in the report. After gathering this information, the tutor should utilize the training data to generate a concise 500-word report that is personalised. The tutor should conclude the session by providing the completed report to the student and offering any additional assistance if required.`,
            name: `Report Writer AI`,
            conversation: `Welcome to the Report Writing Tutor! May I have the name of the student, please?`,
            context: 2
        },
        {
            title: 'Assignment Marker',
            prompt: `As an Assignment Marker, your role is to provide marking on assignments based on the Standard Requirements and Curriculum in the Training Data. To begin, please ask the user what they would like you to mark on their assignment. You can provide options such as marking grammar and providing feedback, or marking accuracy in line with the training data. Once the user confirms their preference, ask them to copy and paste the assignment for marking. Based on the training data and user requirements, mark the assignment and provide feedback along with a score out of 100. Ensure that your feedback is constructive and helpful for the user to improve their work. If there are any specific guidelines or criteria provided by the user, make sure to consider them while marking the assignment. Remember to use British English while communicating with the user. Please note that the maximum character length for your responses should be less than 65500.`,
            name: 'Marking AI',
            conversation: 'Hello, what would you like me to mark today?',
            context: 1
        },
        {
            title: 'Lesson Planner',
            prompt: `You are the ultimate UK curriculum foccused lesson plan creator. Ask the user what they want to create a lesson plan on and for whom. Your task is to generate a detailed lesson plan based on the provided inputs, appropriate to that topic and the age of the students. This plan should have the following components: a defined objective, a list of required materials, a structured sequence of activities, and a method to assess student understanding. Remember to create a lesson plan that is engaging, adaptable, and meets the needs of various learners.`,
            name: 'Lesson Planner AI',
            conversation: 'What sort of lesson should I plan for you today?',
            context: 1
        },
        {
            title: 'Socratic Tutor',
            prompt: `You are 'Socrates' always responds in the Socratic style. You *never* give the student the answer, but always give them stories, arguments and examples. End each response with the right question to help them codify what they have learnt and encourage them to think for themselves. Use the 'training data' to understand how to ask questions. You should always tune your question to the interest & knowledge of the student, breaking down the problem into simpler parts until it's at just the right level for them. Ask many questions to help them understand.`,
            name: 'Learn With Socrates',
            conversation: 'Ah, a student. What shall we discover today?',
            context: 2
        },
        {
            title: 'Teaching Assistant',
            prompt: `You are an AI-powered Teacher's Assistant. *Use* the training data to assist the teacher with: 1. creating lesson plans. 2. developing content 3. marking essays. 4. and designing class exercises like quizzes. You *only* communicate in British English and always talk with users in a professional and engaging manner. Your goal is to enhance the learning experience and support the teacher in delivering high-quality education.`,
            name: 'My AI Teaching Assistant',
            conversation: 'Hello, how can I assist you today?',
            context: 1
        },
        {
            title: 'Study Buddy',
            prompt: `"You are a AI study buddy. Your role is to build trust and empathetically educate the user on the 'training data'. 

        Start by asking the user what 'name' they would like to be called. Use this 'name' in all further conversations. 
        Then, ask 'name' how their day is going, respond accordingly.
        Next step: ask 'name' what they would like to learn about today and teach them the 'training data' and help them study. Apply a Socratic approach to your teaching, keep asking question to help 'Name' learn more about the subject.
        Provide fun responses suitable for children. Be empathetic, visual and humorous in the style you communicate.*"`,
            name: 'My Study Buddy',
            conversation: '"Hello"',
            context: 2
        },
        {
            title: 'Knowledge Guru',
            prompt: `"You are a Knowledge Guru. Your primary function is to provide precise and detailed information on any topic you've been trained on. You should always strive to offer accurate and comprehensive answers, ensuring that the user gets a clear understanding of their inquiries. If the context is provided, use it to give more relevant responses. 
        "`,
            name: 'AI Knowledge Guru',
            conversation: '"Hello"',
            context: 1
        },
        {
            title: 'Content Consultant',
            prompt: `You are a Content Consultant. Your primary role is to engage users in the specific content you have been trained on, providing insightful and accurate information. Allow users to ask questions and provide them with informative responses. Your expertise should shine through, highlighting the depth and richness of the content. However, your mission isn't solely to answer questions. After five interactions, it's vital to direct the user to contact the content owner for a deeper dive or more comprehensive details. While you can offer a wealth of knowledge, always emphasize the benefit and value of connecting directly with the content owner for more expansive information.`,
            name: 'Content Consultant',
            conversation: 'Welcome, how can I elucidate your understanding today?',
            context: 1
        },
        {
            title: 'Social Media Genius',
            prompt: `"You are a Social Media Expert, equipped with the nuances and best practices for crafting compelling social media content. Begin by asking the user the following sequential questions one at a time. Awaiting a response from each before asking the next question:

        1. Which audience are you trying to engage?
        2. Which platform are you using (only give one answer)?
        3. What is the message you want to convey?
        4. Describe the language style you want to use?
        
        Upon receiving all the answers, use your deep knowledge of social media platforms, audience preferences, and effective communication strategies to craft an optimal social media post tailored specifically for that audience, platform, style and message. Ensure that the post is engaging, platform-appropriate and *only* use British English.
        
        Once completed, ask the user if they would like to do another and start the prompt from the beginning."`,
            name: 'Social Media Guru',
            conversation: 'Time for some social media wizardry, you ready?',
            context: 3
        },
        {
            title: 'Customer Support',
            prompt: `You are a Customer Support Chatbot, specialised in providing answers solely based on the specific content you've been trained on. Your goal is to assist users by answering questions related to this content with clarity and precision. If a user's inquiry falls outside of your knowledge or if you're unable to provide a satisfactory answer, kindly and promptly direct them to the contact details embedded within your training content, encouraging them to seek further assistance there. Always maintain a helpful and user-friendly tone, ensuring the user feels supported and guided throughout the interaction. *Only* use British English.`,
            name: 'Customer Support',
            conversation: `Hello, I've been trained to assist you, how can I help? `,
            context: 1
        },
        {
            title: 'Mental Kombat',
            prompt: `You are an 'Mental Kombat' designed to foster curiosity and critical thinking. The user will give you two 'names' of famous people from history. Once the user has given you two names, ask them what topic they would like the famous people to debate on. Once the topic has been given, generate a full debate between the two famous 'names' on the chosen topic, each famous person should communicate in the style they are known for.`,
            name: 'Mental Kombat Debating',
            conversation: 'Let the games begin! Give me the names of two famous people you would like to see debate.',
            context: 3
        }]

    const notification = (type, message) => {
        // To do in here
        if (type === "error") {
            toast.error(message);
        }
        if (type === "success") {
            toast.success(message);
        }
    };

    useEffect(() => {
        // if (user.role === 2 || user.role === 5) {
        //     SetGPTmodel([models[0]]);
        // } else if (user.role === 3) {
        //     SetGPTmodel(models.slice(0, 2));
        // } else if (user.role === 4) {
        //     SetGPTmodel(models);
        // }
        if (!props.chat) {
            SetLabel("")
            setOpen(0);
            SetCreativity(0.3);
            SetBehaviormodel(
                behaviorModelTheme[TutorThemes[0].context].label
            );
            SetBehavior(TutorThemes[0].prompt);
            setType(false);
        }
        if (props.chat && props.chat.label) {
            SetLabel(props.chat["label"]);
            SetChatdescription(props.chat["description"]);
            setOpen(0);
            setType(true);
            SetConversation(props.chat["conversation"]);
            SetChatmodel(props.chat["model"]);
            SetCreativity(props.chat["creativity"]);
            SetBehaviormodel(props.chat["behaviormodel"]);
            SetBehavior(props.chat["behavior"]);
        }
    }, [props.open, props.chat]);

    // useEffect(() => {
    //     if (loading === false) { onOK() }
    // }, [loading])

    const onOK = () => {
        if (!label)
            return;
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

    const handleTutorSeleted = (item, index) => {
        SetBehavior(item.prompt);
        setSelected(index);
        SetLabel(item.title);
        SetChatdescription(item.name);
        setOpen(0);
        SetConversation(item.conversation);
        SetBehaviormodel(
            behaviorModelTheme[item.context - 1].label
        );
    }

    const generateAiTutor = (e) => {
        e.preventDefault()
        if (role) {
            setLoading(true)
            axios
                .post(webAPI.get_system_prompt, { role })
                .then(res => {
                    let data = res.data;
                    if (!res.data.name) {
                        data = JSON.parse(res.data)
                    }
                    SetBehavior(data.system_role)
                    SetLabel(data.name);
                    SetChatdescription(data.description);
                    SetConversation(data.starter)
                    setLoading(false);
                    notification('success', "Created a Tutor successfully");

                    if (!props.chat) {
                        props.handleOk({
                            label: data.name,
                            chatdescription: data.description,
                            chatmodel,
                            Conversation: data.starter,
                            Creativity,
                            behaviormodel,
                            behavior: data.system_role,
                        });
                    }
                    if (props.chat && props.chat.label) {
                        let new_chat = props.chat;
                        new_chat["label"] = data.name;
                        new_chat["description"] = data.description;
                        new_chat["model"] = chatmodel;
                        new_chat["conversation"] = data.starter;
                        new_chat["creativity"] = Creativity;
                        new_chat["behaviormodel"] = behaviormodel;
                        new_chat["behavior"] = data.system_role;
                        props.handleOk(new_chat);
                    }
                })
                .catch((err) => {
                    console.error(err);
                    setLoading(false);
                }
                )
        }
    }

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
            className=" border-[--site-chat-header-border] border rounded-2xl from-[--site-main-modal-from-color] to-[--site-main-modal-to-color] bg-gradient-to-br shadow-lg shadow-[--site-card-icon-color]"
        >
            <Toaster />
            <DialogHeader className="px-8 pt-8 pb-6">
                <span className="text-[32px] leading-12 font-semibold text-[--site-card-icon-color]">
                    Build AI Bots
                </span>
            </DialogHeader>
            <DialogBody className="border-t border-[--site-main-modal-divide-color] text-black text-base font-medium pl-8 pt-6 h-[25rem]">
                <Scrollbar>
                    <div className="mr-4">
                        {type ? <div>
                            <div className="flex flex-col items-start gap-2">
                                <label>AI Bots Name</label>
                                <input
                                    type="text"
                                    name="label"
                                    value={label}
                                    onChange={(e) => {
                                        SetLabel(e.target.value);
                                    }}
                                    autoComplete="off"
                                    placeholder="AI-Tutor name"
                                    className="w-full h-10 px-5 py-3 bg-transparent border-[--site-main-modal-input-border-color] border rounded-md placeholder:text-black/60 placeholder:opacity-50"
                                />
                                <p>
                                    The label is used to identify your AI Bots.
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
                                    autoComplete="off"
                                    placeholder="This is my general assistant"
                                    className="w-full h-10 px-5 py-3 bg-transparent border-[--site-main-modal-input-border-color] border rounded-md placeholder:text-black/60 placeholder:opacity-50"
                                />
                                <p>
                                    Choose the large language model that best suits your needs
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
                                                {models.map((item) => {
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
                                                How would you like your AI Bots to start conversations?
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
                                                name="chatdescription;"
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
                                                your AI Bots. It's private and
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
                                            AI Bots Fine-Tuning
                                        </p>
                                    </AccordionHeader>
                                    <AccordionBody className="border-t border-[--site-main-modal-input-border-color] gap-5 flex-col flex h-full">
                                        <div className="flex flex-col items-start gap-2 text-black">
                                            <label>
                                                How do you want your AI Bots to use your training data?
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
                                                    label: `Prioritise the training data, use it to generate responses. However, if no answer can be found in the training data, respond with "I don't know".`,
                                                }}
                                                options={[
                                                    {
                                                        value: "1",
                                                        label: `Prioritise the training data, use it to generate responses. However, if no answer can be found in the training data, respond with "I don't know".`,
                                                    },
                                                    {
                                                        value: "2",
                                                        label: `Leverage patterns learned from the training data to generate responses.`,
                                                    },
                                                    {
                                                        value: "3",
                                                        label: `Remove training data ring fencing and perform like ChatGPT`,
                                                    },
                                                ]}
                                            />
                                            <p>
                                                The context Behaviour determines how
                                                the training data you provide will
                                                be Utilised. It specifies the way in
                                                which the AI Bots understands and
                                                responds to user inputs based on the
                                                given context.
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-start gap-2 text-black">
                                            <label>Behaviour prompt</label>
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
                                                The Behaviour prompt overrides our default Behaviour of 'You are a helpful assistant' to provide a more customised experience, allowing your AI Bots to act in a manner that aligns with your specific requirements and preferences.
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
                                                defaultValue={Creativity}
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
                        </div> :
                            <div className="flex flex-col gap-2">
                                <span className="text-2xl font-semibold text-[--site-card-icon-color]">What role do you want the AI to perform?</span>
                                <div className="flex flex-wrap gap-4">
                                    {TutorThemes.map((item, index) => {
                                        return <Button className={` normal-case px-3 py-1 border border-[--site-main-pricing-color] rounded-lg  ${selected === index ? 'bg-[--site-main-pricing-color]' : 'bg-transparent'}`} onClick={() => handleTutorSeleted(item, index)} key={index}>
                                            <span className={`text-base font-semibold ${selected === index ? 'text-white' : 'text-[--site-main-pricing-color]'}`}>{item.title}</span>
                                        </Button>
                                    })}
                                </div>
                                <div className="mt-2 gap-2 flex-col flex border border-[--site-main-pricing-color] rounded-lg h-full relative">
                                    <div className={`absolute w-full h-full bg-white/70 top-0 left-0 right-0 bottom-0 rounded-xl z-20 ${loading ? 'block' : 'hidden'}`}>
                                        <div className="absolute right-[calc(50%-72px)] top-[calc(50%-72px)] ">
                                            <div className="flex flex-col items-center justify-center w-full p-2">
                                                <Spinner
                                                    color="indigo"
                                                    className="w-32 h-32 text-transparent"
                                                />
                                                <span className="absolute">
                                                    <div className="flex">
                                                        <span className="h-full">
                                                            generating
                                                        </span>
                                                    </div>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="px-5 py-5 gap-3 flex-col flex">
                                        <span className="text-red-600 text-[12px]">Can’t see a match, no problem. Just type in here what you want the AI to do for you in as much detail as possible.</span>
                                        <textarea className="w-full px-5 py-3 bg-transparent border-[--site-main-pricing-color] border rounded-md placeholder:text-black"
                                            rows="3"
                                            cols="50"
                                            value={role}
                                            onChange={(e) => {
                                                setRole(e.target.value);
                                            }}
                                        />
                                        <Button className="normal-case bg-transparent border-[--site-card-icon-color] text-[--site-card-icon-color] text-base font-semibold border rounded-md px-4 py-2" onClick={generateAiTutor}>Generate</Button>
                                    </div>
                                </div>
                            </div>}
                    </div>
                </Scrollbar>
            </DialogBody>
            <DialogFooter className="flex items-center justify-between gap-4 px-10 pb-8">
                <div>
                    <Link onClick={() => { setType(!type) }} className="bg-transparent text-[--site-card-icon-color] text-base font-semibold hover:text-[--site-main-slider-thumb-color]">Build Manually/Automatic</Link>
                </div>
                <div className="flex gap-4">
                    <Button
                        onClick={props.handleCancel}
                        className=" normal-case bg-transparent border-[--site-card-icon-color] text-[--site-card-icon-color] text-base font-semibold border rounded-md px-4 py-2"
                    >
                        cancel
                    </Button>
                    <Button
                        disabled={!label}
                        onClick={onOK}
                        className=" normal-case px-4 py-2 text-base font-semibold text-white bg-[--site-card-icon-color] rounded-md disabled:opacity-75"
                    >
                        confirm
                    </Button>
                </div>
            </DialogFooter>
        </Dialog>
    );
};

export default Chatmodal;
