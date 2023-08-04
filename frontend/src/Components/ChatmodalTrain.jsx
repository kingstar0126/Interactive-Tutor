import { useState, useEffect } from "react";
import Select from "react-select";
import { webAPI } from "../utils/constants";
import axios from "axios";
import { useSelector } from "react-redux";
import toast, { Toaster } from "react-hot-toast";
import { Scrollbar } from "react-scrollbars-custom";
import {
    Progress,
    DialogHeader,
    Dialog,
    DialogBody,
    DialogFooter,
    Spinner,
} from "@material-tailwind/react";

const ChatmodalTrain = (props) => {
    const [type, SetType] = useState("1");
    const [label, SetLabel] = useState("");
    const [url, Seturl] = useState("");
    const [file, setFile] = useState("");
    const [text, setText] = useState("");
    const [progress, setProgress] = useState(0);
    const [isloading, setIsloading] = useState(false);
    const [isurlloading, setIsurlloading] = useState(false);
    const chat = JSON.parse(useSelector((state) => state.chat.chat));
    const notification = (type, message) => {
        // To do in here
        if (type === "error") {
            toast.error(message);
        }
        if (type === "success") {
            toast.success(message);
        }
    };

    const urlPatternValidation = (url) => {
        const regex = new RegExp(
            "^(https?://)([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?"
        );
        return regex.test(url);
    };

    const onOK = () => {
        let chatbot = chat.uuid;
        if (type === "1") {
            if (urlPatternValidation(url)) {
                setIsurlloading(true);
                let data;
                data = { url, chatbot };
                axios
                    .post(webAPI.sendurl, data)
                    .then((res) => {
                        if (res.data.code === 401) {
                            notification("error", res.data.message);
                        }
                        props.handleOk(res.data.data);
                        setIsurlloading(false);
                    })
                    .catch((error) => {
                        setIsurlloading(false);
                    });
            } else {
                notification("error", "Invalued URL");
            }
        } else if (type === "2") {
            if (file && file.name) {
                let data = new FormData();
                let chatbot = chat.uuid;
                const filename = file.name.replaceAll(" ", "");
                data.append("file", file, filename);
                data.append("chatbot", chatbot);
                const config = {
                    onUploadProgress: (progressEvent) => {
                        const progress = Math.round(
                            (progressEvent.loaded / progressEvent.total) * 100
                        );
                        setProgress(progress);
                    },
                };
                axios
                    .post(webAPI.sendfile, data, config)
                    .then((res) => {
                        setIsloading(false);
                        if (!res.data.success) {
                            notification("error", res.data.message);
                            props.handleCancel();
                        } else {
                            notification("success", res.data.message);
                            props.handleOk(res.data.data);
                        }
                        props.handleOk(res.data.data);
                    })
                    .catch((err) => {
                        notification("error", "Failed Uploading File");
                        setIsloading(false);
                    });
            }
        } else {
            let data;
            data = { text, chatbot };
            axios
                .post(webAPI.sendtext, data)
                .then((res) => {
                    props.handleOk(res.data.data);
                })
                .catch((err) => console.log(err));
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    };

    useEffect(() => {
        setProgress(0);
        SetLabel("");
        Seturl("");
        setText("");
    }, [props.open]);

    useEffect(() => {
        if (progress === 100) {
            setIsloading(true);
        }
    }, [progress]);

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
                    Add provider
                </span>
            </DialogHeader>
            <DialogBody className="border-t border-[--site-main-modal-divide-color] text-black text-base font-medium flex flex-col h-[30rem]">
                <Scrollbar>
                    <div className="mr-4">
                        <div className="flex flex-col gap-6 px-8 py-5">
                            <div className="flex flex-col items-start gap-2">
                                <label className="text-base font-medium">
                                    Context behavior (Required)
                                </label>
                                <Select
                                    styles={customStyles}
                                    isSearchable={false}
                                    className="w-full border-[--site-main-modal-input-border-color] border rounded-md"
                                    onChange={(e) => {
                                        SetType(e.value);
                                    }}
                                    defaultValue={{
                                        value: "1",
                                        label: "URLs",
                                    }}
                                    options={[
                                        {
                                            value: "1",
                                            label: "URLs",
                                        },
                                        {
                                            value: "2",
                                            label: "Files",
                                        },
                                        {
                                            value: "3",
                                            label: "Texts",
                                        },
                                    ]}
                                />
                                <p className="text-start">
                                    Please select the type of content you want
                                    to provide: URLs, files, or text.
                                </p>
                            </div>
                            <div className="flex flex-col items-start gap-2">
                                <label className="text-base font-medium">
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
                                    className="w-full h-10 px-5 py-3 bg-transparent border-[--site-main-modal-input-border-color] border rounded-md placeholder:text-black placeholder:opacity-50"
                                />
                                <p className="text-start">
                                    The label is used to identify your provider.
                                    It's private and exclusively visible to you.
                                </p>
                                {!label && (
                                    <p className="text-[12px] text-[--site-main-form-error]">
                                        * Label (Private) is required
                                    </p>
                                )}
                            </div>
                            <div className="p-6 border-[--site-main-modal-input-border-color] border rounded-md">
                                {type === "1" && (
                                    <div className="flex flex-col items-start gap-2">
                                        <label className="text-base font-medium">
                                            URL (Required)
                                        </label>
                                        <input
                                            type="url"
                                            name="label"
                                            value={url}
                                            onChange={(e) => {
                                                Seturl(e.target.value);
                                            }}
                                            placeholder="https://example.com"
                                            className="w-full h-10 px-5 py-3 bg-transparent border-[--site-main-modal-input-border-color] border rounded-md placeholder:text-black placeholder:opacity-50"
                                        />
                                        {!label && (
                                            <p className="text-[12px] text-[--site-main-form-error]">
                                                * URL is required.
                                            </p>
                                        )}
                                        {isurlloading && (
                                            <div className="flex flex-col items-center justify-center w-full p-2">
                                                <Spinner
                                                    color="pink"
                                                    className="w-32 h-32"
                                                />
                                                <span className="absolute">
                                                    <div className="flex">
                                                        <span className="h-full">
                                                            Embedding
                                                        </span>
                                                    </div>
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}
                                {type === "2" && (
                                    <div className="flex flex-col items-start gap-2">
                                        <label className="text-base font-medium">
                                            Add file(s) (Required)
                                        </label>
                                        <input
                                            type="file"
                                            name="label"
                                            onChange={(e) =>
                                                handleFileChange(e)
                                            }
                                            accept=".pdf,.csv,.docx, .srt, .epub, .txt,
                    .md, .json"
                                            max="100000000"
                                            className="block w-full text-sm border rounded-md text-black file:mr-4 file:py-2 file:px-4 file:rounded-md file:border file:text-sm file:font-medium file:bg-[--site-file-upload] file:border-[--site-main-modal-input-border-color] file:text-black hover:file:opacity-75 border-[--site-main-modal-input-border-color]"
                                        />
                                        <p className="text-sm text-start">
                                            Accepted formats : .pdf, .csv,
                                            .docx, .srt, .epub, .txt, .md,
                                            .json, - Max file size: 100MB
                                        </p>
                                        {progress > 0 && progress < 100 && (
                                            <div className="flex flex-col w-full">
                                                <div className="flex flex-col items-center justify-between w-full mb-2">
                                                    <div className="flex w-full">
                                                        <Progress
                                                            value={progress}
                                                            size="md"
                                                            color="green"
                                                            className="border-[--site-main-modal-input-border-color] border"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {isloading && (
                                            <div className="flex flex-col items-center justify-center w-full p-2">
                                                <Spinner
                                                    color="pink"
                                                    className="w-32 h-32"
                                                />
                                                <span className="absolute">
                                                    <div className="flex">
                                                        <span className="h-full">
                                                            Embedding
                                                        </span>
                                                    </div>
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}
                                {type === "3" && (
                                    <div className="flex flex-col items-start gap-2">
                                        <label className="text-base font-medium">
                                            Text (Required)
                                        </label>
                                        <textarea
                                            type="text"
                                            cols={50}
                                            rows={5}
                                            onChange={(e) =>
                                                setText(e.target.value)
                                            }
                                            className="w-full min-h-40 px-5 py-3 bg-transparent border-[--site-main-modal-input-border-color] border rounded-md placeholder:text-black placeholder:opacity-50"
                                        />
                                    </div>
                                )}
                            </div>
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

export default ChatmodalTrain;
