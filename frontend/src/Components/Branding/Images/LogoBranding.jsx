import { useState, useEffect } from "react";
import Switch from "../../Switch";
import Dropzone from "react-dropzone";
import axios from "axios";
import toast from "react-hot-toast";
import { webAPI } from "../../../utils/constants";
import { SERVER_URL } from "../../../config/constant";

const LogoBranding = (props) => {
    const [text, setText] = useState("Disable");
    const [status, setStatus] = useState(props.data.status);
    const [selectedLogo, setSelectedLogo] = useState(null);
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
        if (props.data.url) {
            setSelectedLogo(props.data.url);
        }
    }, [props.data]);

    const handleFileChange = (files) => {
        if (files[0].size > 1024 * 1024) {
            notification("error", "Maximum image size allowed is 1MB.");
            return;
        }
        setSelectedLogo(files[0]);
    };

    const handleUpload = () => {
        if (selectedLogo) {
            console.log(selectedLogo);
            const formData = new FormData();

            const filename = selectedLogo.name.replace(" ", "");

            formData.append("file", selectedLogo, filename);
            axios
                .post(webAPI.imageupload, formData)
                .then((res) => {
                    notification("success", "Uploaded successfully!");
                    let url = SERVER_URL + res.data.data;
                    handleLogo(url);
                    setSelectedLogo(props.data.url);
                })
                .catch((err) => console.error(err));
        }
    };

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

    const handleLogo = (data) => {
        props.data.url = data;
    };

    return (
        <div>
            <div className="flex flex-col gap-5 p-2">
                <h1 className="border-b-[1px] border-[--site-card-icon-color] font-semibold pb-2">
                    {props.title}
                </h1>
                <div name="switch" className="gap-2">
                    <span className="font-medium">Status</span>
                    <div className="flex w-full gap-2 font-medium">
                        <Switch handlechange={change_text} toggle={status} />
                        <span>{text}</span>
                    </div>
                </div>
                <div name="input" className="flex flex-col w-full gap-3 p-2">
                    <div className="w-full">
                        <span>Select your Logo</span>
                        <div>
                            <div className="border-[1px] rounded-xl border-[--site-card-icon-color] w-[70px] h-[70px]">
                                <Dropzone
                                    onDrop={handleFileChange}
                                    multiple={false}
                                >
                                    {({ getRootProps, getInputProps }) => (
                                        <div
                                            className="flex items-center justify-center w-full h-full dropzone"
                                            {...getRootProps()}
                                        >
                                            <input {...getInputProps()} />
                                            {selectedLogo ? (
                                                <div>
                                                    <img
                                                        src={selectedLogo}
                                                        alt="Selected"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-[50px] h-[50px]">
                                                    <p>Image</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </Dropzone>
                            </div>
                            <button
                                onClick={handleUpload}
                                className="p-2 rounded-xl bg-[--site-logo-text-color] my-2 border-[1px] border-[--site-card-icon-color] font-bold"
                            >
                                Upload
                            </button>
                        </div>
                    </div>
                    <div className="flex w-full gap-3">
                        <div className="flex flex-col w-1/2">
                            <span>Height (pixel)</span>
                            <input
                                defaultValue={props.data.height}
                                onChange={(e) => {
                                    props.data.height = e.target.value;
                                }}
                                className="w-full rounded-full p-2 border-[1px] border-[--site-card-icon-color]"
                                type="number"
                            />
                        </div>
                        <div className="flex flex-col w-1/2">
                            <span>Width (pixel)</span>
                            <input
                                onChange={(e) => {
                                    props.data.width = e.target.value;
                                }}
                                defaultValue={props.data.width}
                                className="w-full rounded-full p-2 border-[1px] border-[--site-card-icon-color]"
                                type="number"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LogoBranding;
