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
  const [menu, setMenu] = useState(null);
  const [subMenu, setSubMenu] = useState(0);
  const [sortby, setSortBy] = useState(0);
  const [page, setPage] = useState(1);
  const [chats, setChats] = useState([]);
  const [pageCount, setPageCount] = useState(1);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    getPublishChats();
  }, [menu, subMenu, sortby, page]);

  useEffect(() => {
    if (location.state && location.state.page) {
      setPage(location.state.page);
    }
  }, [location]);

  const getPublishChats = () => {
    axios
      .post(webAPI.getpublishchats, {
        menu,
        subMenu,
        sortby,
        page,
        perpage: PER_PAGE,
      })
      .then((res) => {
        if (res.data.success) {
          setChats(res.data.data);
          setPageCount(res.data.pageCount);
        } else {
          console.error(res.data.message);
        }
      })
      .catch((err) => console.error(err));
  };

  const handleItemClick = (chat) => {
    navigate("/itemdescription", { state: { chat, page } });
  };

  const getSubMenus = () => {
    if (menu === 1) {
      return ROLES;
    } else if (menu === 2) {
      return SUBJECTS;
    } else if (menu === 3) {
      return TASKS;
    } else {
      return FUNS;
    }
  };

  return (
    <div className="container items-center justify-center m-auto py-5">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-4 md:flex-row flex-col">
          <div className="flex gap-4 md:w-2/3 flex-col md:flex-row w-full">
            <Select
              onChange={(e) => setMenu(e.value)}
              className="rounded-md md:w-1/4 border border-footerPrimary"
              placeholder="Select the Menu"
              options={[
                { label: "Role", value: 1 },
                { label: "Subject", value: 2 },
                { label: "Task", value: 3 },
                { label: "Just For Fun", value: 4 },
              ]}
            />

            <Select
              onChange={(e) => setSubMenu(e.value)}
              className="rounded-md md:w-1/4 border border-footerPrimary"
              placeholder="Subject"
              options={getSubMenus().map((item, id) => {
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
            <div onClick={() => handleItemClick(chat)} key={idx}>
              <ChatItem key={idx} data={chat} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashBoard;
