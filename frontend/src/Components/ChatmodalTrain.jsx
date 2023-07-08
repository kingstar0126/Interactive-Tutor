import { useState, useEffect } from "react";
import Select from "react-select";
import { webAPI } from "../utils/constants";
import axios from "axios";
import { useSelector } from "react-redux";
import toast, { Toaster } from "react-hot-toast";
import ReactLoading from "react-loading";

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
                        props.handleOk(res.data.data);
                        setIsurlloading(false);
                    })
                    .catch((error) => {
                        console.log(error);
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
                console.log(file, filename, chatbot);
                axios
                    .post(webAPI.sendfile, data, config)
                    .then((res) => {
                        console.log(res);
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
                        console.log(err);
                        notification("error", "Failed Uploading File");
                        setIsloading(false);
                    });
            }
        } else {
            let data;
            data = { text, chatbot };
            axios
                .post(webAPI.sendtext, data)
                .then((res) => props.handleOk(res.data.data))
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

    const showHideClassname = props.open
        ? "fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto"
        : "hidden";
    return (
        <div className={showHideClassname}>
            <div className="relative w-3/5 h-auto text-white p-5 mx-auto rounded-md shadow-lg top-10 bg-[--site-card-icon-color]">
                <div className="mt-3 divide-y text-start">
                    <h3 className="text-lg font-medium leading-6">
                        Add provider
                    </h3>
                    <div className="py-3 mt-2 px-7">
                        <div className="flex flex-col items-start py-2">
                            <label className="mb-1 text-sm font-semibold">
                                Context behavior (Required)
                            </label>
                            <Select
                                className="w-full mb-1 text-[--site-card-icon-color]"
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
                            <p className="text-sm text-[--site-main-color5] text-start">
                                Please select the type of content you want to
                                provide: URLs, files, or text.
                            </p>
                        </div>
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
                                className="mb-1 text-[--site-card-icon-color] w-full focus:border-none focus:ring-opacity-40 focus:outline-none p-1 focus:ring focus:border-[--site-main-color4] h-10 border rounded-lg hover:border-[--site-main-color5]"
                            />
                            <p className="text-sm text-[--site-main-color5]">
                                The label is used to identify your provider.
                                It's private and exclusively visible to you.
                            </p>
                            {!label && (
                                <p className="text-[12px] text-[--site-main-form-error]">
                                    * Label (Private) is required
                                </p>
                            )}
                        </div>
                        <div className="p-5 border rounded-lg">
                            {type === "1" && (
                                <div className="flex flex-col items-start py-2">
                                    <label className="mb-1 text-sm font-semibold">
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
                                        className="mb-1 text-[--site-card-icon-color] w-full focus:border-none focus:ring-opacity-40 focus:outline-none p-1 focus:ring focus:border-[--site-main-color4] h-10 border rounded-lg hover:border-[--site-main-color5]"
                                    />
                                    {!label && (
                                        <p className="text-[12px] text-[--site-main-form-error]">
                                            URL is required.
                                        </p>
                                    )}
                                    {isurlloading && (
                                        <div className="flex flex-col items-center justify-center w-full p-2">
                                            <ReactLoading
                                                type="spin"
                                                color="#c1ff72"
                                                height={40}
                                                width={40}
                                                delay={15}
                                            ></ReactLoading>
                                            <span>
                                                Embedding training data...
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}
                            {type === "2" && (
                                <div className="flex flex-col items-start py-2">
                                    <label className="mb-1 text-sm font-semibold">
                                        Add file(s) (Required)
                                    </label>
                                    <input
                                        type="file"
                                        name="label"
                                        onChange={(e) => handleFileChange(e)}
                                        accept=".pdf,.csv,.docx, .srt, .epub, .txt,
                    .md, .json"
                                        max="100000000"
                                        className="block w-full text-sm border rounded-full text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[--site-file-upload] file:text-[--site-card-icon-color] hover:file:bg-[--site-main-color3] hover:file:text-[--site-card-icon-color] hover:file:scale-110"
                                    />
                                    <p className="text-sm text-[--site-main-color5] text-start">
                                        Accepted formats : .pdf, .csv, .docx,
                                        .srt, .epub, .txt, .md, .json, - Max
                                        file size: 100MB
                                    </p>
                                    {progress > 0 && (
                                        <div className="flex flex-col w-full">
                                            <div className="flex flex-col items-center justify-between w-full mb-2">
                                                <div className="flex w-full">
                                                    <span
                                                        style={{
                                                            width: `${progress}%`,
                                                        }}
                                                        className="flex justify-end text-xs font-semibold text-pink-600"
                                                    >
                                                        {progress}
                                                        <span>%</span>
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex w-full h-2 mb-4 overflow-hidden text-xs bg-pink-200 rounded">
                                                <div
                                                    style={{
                                                        width: `${progress}%`,
                                                    }}
                                                    className="flex flex-col justify-center text-center text-white bg-[--site-logo-text-color] w-full shadow-none whitespace-nowrap"
                                                ></div>
                                            </div>
                                        </div>
                                    )}
                                    {isloading && (
                                        <div className="flex flex-col items-center justify-center w-full">
                                            <ReactLoading
                                                type="spin"
                                                color="#c1ff72"
                                                height={40}
                                                width={40}
                                                delay={15}
                                            ></ReactLoading>
                                            <span>
                                                Embedding training data...
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}
                            {type === "3" && (
                                <div className="flex flex-col items-start py-2">
                                    <label className="mb-1 text-sm font-semibold">
                                        Text (Required)
                                    </label>
                                    <textarea
                                        type="text"
                                        cols={50}
                                        rows={5}
                                        onChange={(e) =>
                                            setText(e.target.value)
                                        }
                                        className="mb-1 w-full text-[--site-card-icon-color] focus:border-none focus:ring-opacity-40 focus:outline-none p-1 focus:ring focus:border-[--site-main-color4] border rounded-lg hover:border-[--site-main-color5]"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center justify-between px-4 py-3">
                        <button
                            onClick={props.handleCancel}
                            className="w-auto px-4 py-2 text-base font-medium text-black border bg-[--site-main-color3] rounded-md shadow-sm hover:bg-[--site-main-color8] focus:outline-none focus:ring-2 focus:ring-green-300"
                        >
                            cancel
                        </button>

                        {label ? (
                            <button
                                onClick={onOK}
                                className="w-auto px-4 py-2 text-base font-medium text-white bg-[--site-main-form-success1] border rounded-md shadow-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300"
                            >
                                confirm
                            </button>
                        ) : (
                            <button
                                onClick={onOK}
                                disabled
                                className="w-auto px-4 py-2 text-base font-medium text-white bg-green-500 border rounded-md shadow-sm disabled:opacity-75"
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

export default ChatmodalTrain;
