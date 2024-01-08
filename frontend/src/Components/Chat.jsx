import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { Outlet } from "react-router-dom";
import { webAPI } from "../utils/constants";
import axios from "axios";
import { Spinner } from "@material-tailwind/react";

const Chat = () => {
  const navigate = useNavigate();
  const user = JSON.parse(useSelector((state) => state.user.user));
  const [isLoading, setIsLoading] = useState(false);
  const { state } = useLocation();
  const location = useLocation();

  const getChats = async () => {
    setIsLoading(true);
    let data = {
      user_id: user.id,
    };
    await axios.post(webAPI.getchats, data).then((res) => {
      setIsLoading(false);
      if (res.data.success) {
        const count = res.data.data.filter(
          (item) => item.islibrary !== true
        ).length;
        if (user.role === 5 || user.role === 0 || count == 0) {
          navigate("onboarding");
        } else if (!location.pathname.includes("newchat")) {
          navigate("dashboard");
        }
      } else {
        setIsLoading(false);
        navigate("onboarding");
        console.error(res.data.message);
      }
    });
  };

  useEffect(() => {
    getChats();
  }, [state?.forceRefresh]);

  return (
    <div className="flex w-full h-full">
      {isLoading ? (
        <div className="w-full h-full flex items-center justify-center">
          <Spinner color="pink" className="w-32 h-32" />
        </div>
      ) : (
        <Outlet />
      )}
    </div>
  );
};

export default Chat;
