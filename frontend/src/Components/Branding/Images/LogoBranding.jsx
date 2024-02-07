import { useState, useEffect } from "react";
import Switch from "../../Switch";
import Dropzone from "react-dropzone";
import toast from "react-hot-toast";
import { Button } from "@material-tailwind/react";
import { chatLogoPath } from "../../../utils/logoPath";
import { uploadImage } from "../../../utils/uploadImage";

const LogoBranding = (props) => {
  const [text, setText] = useState("Disable");
  const [status, setStatus] = useState(
    props.data.status === undefined ? true : props.data.status
  );
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
    handleUpload(files[0]);
    const imageURL = URL.createObjectURL(files[0]);
    setFile(files[0]);
    setSelectedLogo(imageURL);
  };

  const handleUpload = (file) => {
    if (file) {
      uploadImage(chatLogoPath.CHAT_AVATAR_PATH, file).then((fileUrl) => {
        setSelectedLogo(fileUrl);
        handleLogo(fileUrl);
        notification("success", "Uploaded successfully!");
      });
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
      <div className="flex flex-col gap-5 border border-[--site-chat-header-border] rounded-lg p-4">
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
            <span>Your Logo</span>
            {selectedLogo && (
              <div className="mt-2 mb-3">
                <div className="border rounded-md border-[--site-chat-header-border] w-1/3 h-auto">
                  <Dropzone onDrop={handleFileChange} multiple={false}>
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
              </div>
            )}

            <div className="upload-image-btn">
              <input
                type="file"
                id="upload"
                hidden
                onChange={(e) => {
                  handleFileChange(e.target.files);
                }}
              />
              <label htmlFor="upload">Upload</label>
            </div>
          </div>
          <div className="flex w-full gap-3">
            <div className="flex flex-col w-1/2 gap-2">
              <span>Height (pixel)</span>
              <input
                defaultValue={props.data.height}
                onChange={(e) => {
                  props.data.height = e.target.value;
                }}
                className="w-full p-2 border border-[--site-chat-header-border] rounded-md bg-transparent"
                type="number"
              />
            </div>
            <div className="flex flex-col w-1/2 gap-2">
              <span>Width (pixel)</span>
              <input
                onChange={(e) => {
                  props.data.width = e.target.value;
                }}
                defaultValue={props.data.width}
                className="w-full p-2 border border-[--site-chat-header-border] rounded-md bg-transparent"
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
