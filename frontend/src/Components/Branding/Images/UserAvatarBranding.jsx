import Dropzone from "react-dropzone";
import axios from "axios";
import toast from "react-hot-toast";
import { webAPI } from "../../../utils/constants";
import { SERVER_URL } from "../../../config/constant";
import { useState, useEffect } from "react";
import { Button } from "@material-tailwind/react";

const UserAvatarBranding = (props) => {
    const [selectedLogo, setSelectedLogo] = useState(null);
    const [flag, setFlag] = useState(false);
    const [file, setFile] = useState(null);
    const notification = (type, message) => {
        // To do in here
        if (type === "error") {
            toast.error(message);
        }
        if (type === "success") {
            toast.success(message);
        }
    };

    const handleFileChange = (files) => {
        if (files[0].size > 1024 * 1024) {
            notification("error", "Maximum image size allowed is 1MB.");
            return;
        }
        setFlag(true);
        const imageURL = URL.createObjectURL(files[0]);
        setFile(files[0]);
        setSelectedLogo(imageURL);
    };

    useEffect(() => {
        if (props.data.user) {
            setSelectedLogo(props.data.user);
        }
    }, [props.data]);

    const handleUpload = () => {
        if (file && flag) {
            const formData = new FormData();

            const filename = file.name.replace(" ", "");

            formData.append("file", file, filename);
            axios
                .post(webAPI.imageupload, formData)
                .then((res) => {
                    notification("success", "Uploaded successfully!");
                    let url = SERVER_URL + res.data.data;
                    setSelectedLogo(url);
                    handleLogo(url);
                })
                .catch((err) => console.error(err));
            setFlag(false);
        }
    };

    const handleLogo = (data) => {
        props.data.user = data;
    };

    return (
        <div>
            <div className="flex flex-col gap-5 border border-[--site-chat-header-border] rounded-lg p-4">
                <h1 className="border-b-[1px] border-[--site-card-icon-color] font-semibold pb-2">
                    {props.title}
                </h1>
                <div className="flex flex-col gap-2">
                    <span>User avatar URL</span>
                    <div>
                        <div className="border-[1px] rounded-xl border-[--site-chat-header-border] w-1/3 h-auto">
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
                                            <div className="m-1">
                                                <img
                                                    src={selectedLogo}
                                                    alt="Selected"
                                                    className="rounded-md"
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
                        <Button
                            onClick={() => {
                                handleUpload();
                            }}
                            className="normal-case p-2 rounded-md bg-[--site-logo-text-color] my-2 border border-[--site-chat-header-border] text-black text-base"
                        >
                            Upload
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserAvatarBranding;
