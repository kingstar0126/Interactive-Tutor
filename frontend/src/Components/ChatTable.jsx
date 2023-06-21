import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { webAPI } from "../utils/constants";
import Chatmodal from "./Chatmodal";
import { useState, useEffect } from "react";

const ChatTable = (props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [chat, SetChat] = useState([]);
  const [currentchat, SetCurrentchat] = useState({});

  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleOk = (data) => {
    console.log(data);
    axios.post(webAPI.updatechat, data).then((res) => {
      if (!res.data.success) notification("error", res.data.message);
      else {
        notification("success", res.data.message);
        getChats();
      }
    });
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };
  const getChats = () => {
    axios.get(webAPI.getchats).then((res) => {
      SetChat(res.data.data);
    });
  };
  const notification = (type, message) => {
    // To do in here
    if (type === "error") {
      toast.error(message);
    }
    if (type === "success") {
      toast.success(message);
    }
  };
  const handleDelete = (id) => {
    axios
      .delete(`${webAPI.deletechat}/${id}`)
      .then((res) => {
        notification("success", res.data.message);
        props.handledelete();
      })
      .catch((err) => {
        console.error("Failed to delete chat:", err);
        // Handle errors here
      });
  };
  return (
    <div className="relative overflow-x-auto rounded-xl">
      <Toaster />
      <table className="w-full bg-[--site-main-color10] text-sm text-left text-[--site-main-Table-Text]">
        <thead className="text-xs text-[--site-main-Table-Tex] uppercase dark:bg-[--site-main-Table-Tex] dark:text-[--site-main-Table-Text_Dark]">
          <tr className="w-full">
            <th className="w-1/5 px-6 py-3">Label</th>
            <th className="w-1/5 px-6 py-3">Description</th>
            <th className="w-1/5 px-6 py-3">Welcome message</th>
            <th className="w-1/5 px-6 py-3">Behavior prompt</th>
            <th className="w-1/5 px-6 py-3 text-center">Action</th>
          </tr>
        </thead>

        <tbody>
          {props.chat.map((data, index) => {
            return (
              <tr className="bg-white border-b" key={index}>
                <th
                  scope="row"
                  className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
                >
                  {data["label"]}
                </th>
                <td className="px-6 py-4">{data["description"]}</td>
                <td className="px-6 py-4">{data["conversation"]}</td>
                <td className="px-6 py-4">{data["behavior"]}</td>
                <td className="flex gap-2 px-6 py-4">
                  <div className="flex gap-2">
                    <span className="w-[60px] text-center hover:bg-[--site-main-form-success] hover:text-white p-2 border rounded-xl active:bg-[--site-main-form-success1] select-none active:text-white border-[--site-main-form-success]">
                      Open
                    </span>
                    <span
                      onClick={() => {
                        SetCurrentchat(data);
                        showModal();
                      }}
                      className="w-[60px] text-center border-[--site-main-color9] hover:bg-[--site-main-color9] hover:text-white p-2 border rounded-xl active:bg-[--site-main-color4] select-none active:text-white"
                    >
                      Edit
                    </span>
                    <span
                      onClick={() => handleDelete(data["id"])}
                      className="w-[60px] text-center hover:bg-[--site-main-form-error] border-[--site-main-form-error] hover:text-white p-2 border rounded-xl active:bg-[--site-main-form-error1] select-none active:text-white"
                    >
                      Delete
                    </span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <Chatmodal
        chat={currentchat}
        open={isModalOpen}
        handleOk={handleOk}
        handleCancel={handleCancel}
      />
    </div>
  );
};

export default ChatTable;
