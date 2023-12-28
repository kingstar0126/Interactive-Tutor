import React, { useEffect, useState } from "react";
import Select from "react-select";
import axios from "axios";
import { webAPI } from "../utils/constants";
import ChatItem from "./ChatItem";
import Pagination from "./Pagination";
import { ROLES, SUBJECTS, TASKS, FUNS } from "../utils/config";
import { useNavigate, useLocation } from "react-router-dom";

const PER_PAGE = 8;

const DashBoard = () => {
  const [role, setRole] = useState(null);
  const [subject, setSubject] = useState(null);
  const [task, setTask] = useState(null);
  const [fun, setFun] = useState(null);
  const [sortby, setSortBy] = useState(null);
  const [page, setPage] = useState(1);
  const [chats, setChats] = useState([]);
  const [pageCount, setPageCount] = useState(1);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    getPublishChats();
  }, [role, subject, task, fun, sortby, page]);

  useEffect(() => {
    if (location.state && location.state.page) {
      setPage(location.state.page);
    }
  }, [location]);

  const getPublishChats = () => {
    axios
      .post(webAPI.getpublishchats, {
        role,
        subject,
        task,
        fun,
        sortby,
        page,
        perpage: PER_PAGE,
      })
      .then((res) => {
        setChats(res.data.data);
        setPageCount(res.data.pageCount);
      })
      .catch((err) => console.error(err));
  };

  const handleItemClick = (chat) => {
    navigate("/itemdescription", { state: { chat, page } });
  };

  return (
    <div className="container items-center justify-center m-auto py-5">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-4 md:flex-row flex-col">
          <div className="flex gap-4 md:w-2/3 flex-col md:flex-row w-full">
            <Select
              onChange={(e) => setRole(e.value)}
              className="rounded-md md:w-1/4 border border-footerPrimary"
              placeholder="Role"
              options={ROLES.map((item, id) => {
                return { label: item, value: id + 1 };
              })}
            />

            <Select
              onChange={(e) => setSubject(e.value)}
              className="rounded-md md:w-1/4 border border-footerPrimary"
              placeholder="Subject"
              options={SUBJECTS.map((item, id) => {
                return { label: item, value: id + 1 };
              })}
            />

            <Select
              onChange={(e) => setTask(e.value)}
              className="rounded-md md:w-1/4 border border-footerPrimary"
              placeholder="Task"
              options={TASKS.map((item, id) => {
                return { label: item, value: id + 1 };
              })}
            />
            <Select
              onChange={(e) => setFun(e.value)}
              className="rounded-md md:w-1/4 border border-footerPrimary"
              placeholder="Just For Fun"
              options={FUNS.map((item, id) => {
                return { label: item, value: id + 1 };
              })}
            />
          </div>
          <div className="md:w-1/3 md:justify-end items-center flex w-full">
            <Select
              onChange={(e) => setSortBy(e.value)}
              className="rounded-md md:w-1/2 border-footerPrimary border w-full"
              placeholder="Sort by"
              options={[
                { label: "Most popular", value: 1 },
                { label: "Newest", value: 0 },
              ]}
            />
          </div>
        </div>
        <div className="w-full justify-end items-center flex py-2">
          <Pagination
            page={page}
            onPageChange={(newPage) => setPage(newPage)}
            count={pageCount}
          />
        </div>
        <div className="chatItem">
          {chats.map((chat, idx) => (
            <div onClick={() => handleItemClick(chat)}>
              <ChatItem key={idx} data={chat} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashBoard;
