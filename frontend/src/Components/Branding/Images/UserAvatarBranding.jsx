import Dropzone from "react-dropzone";
import axios from "axios";
import toast from "react-hot-toast";
import { webAPI } from "../../../utils/constants";
import { SERVER_URL } from "../../../config/constant";
import { useState, useEffect } from "react";

const UserAvatarBranding = (props) => {
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

    const handleFileChange = (files) => {
        if (files[0].size > 1024 * 1024) {
            notification("error", "Maximum image size allowed is 1MB.");
            return;
        }
        setSelectedLogo(files[0]);
    };

    useEffect(() => {
        if (props.data.url) {
            setSelectedLogo(props.data.url);
        }
    }, [props.data]);

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
                    setSelectedLogo(props.data.url);
                    handleLogo(url);
                })
                .catch((err) => console.error(err));
        }
    };

    const handleLogo = (data) => {
        props.data.user = data;
    };

    return (
        <div>
            <div className="flex flex-col gap-5 p-2">
                <h1 className="border-b-[1px] border-[--site-card-icon-color] font-semibold pb-2">
                    {props.title}
                </h1>
                <div className="flex flex-col gap-2">
                    <span>User avatar URL</span>
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
            </div>
        </div>
    );
};

export default UserAvatarBranding;
