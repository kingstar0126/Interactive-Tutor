import React from "react";
import Header from "../Layout/Header";
import { Outlet } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import PinField from "react-pin-field";
import { webAPI } from "../utils/constants";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import ReactLoading from "react-loading";
import { useLocation } from "react-router-dom";
import { setlocation } from "../redux/actions/locationAction";
import { setchatbot, getchat } from "../redux/actions/chatAction";

const AccessChatbot = () => {
    const chatState = useSelector((state) => state.chat.chat);
    const chat = (chatState && JSON.parse(chatState)) || {};
    const [error, SetError] = useState(false);
    const navigate = useNavigate();
    const [organization, setOrganization] = useState("");
    const [validate, SetValidate] = useState(false);
    let location = useLocation();
    const chatbot = useSelector((state) => state.chat.chatbot);
    const dispatch = useDispatch();
    const pinField = useRef(null);
    const [status, setStatus] = useState(false);
    const [isloading, setLoadindg] = useState(false);
    const notification = (type, message) => {
        // To do in here
        if (type === "error") {
            toast.error(message);
        }
        if (type === "success") {
            toast.success(message);
        }
    };

    const submit = async (pin) => {
        await axios
            .post(webAPI.getChatwithPIN, {
                organization: organization,
                pin: pin,
            })
            .then(async (res) => {
                if (res.data.success === false) {
                    notification("error", res.data.message);
                    setLoadindg(false);
                    setStatus(false);
                } else {
                    getchat(dispatch, res.data.data);
                    let chat = res.data.data;
                    let response = await axios.get(
                        "https://geolocation-db.com/json/"
                    );
                    let country = response.data.country_name || "";
                    chat["country"] = country;
                    setchatbot(dispatch, chat);
                    setStatus(true);
                    navigate("newchat");
                }
            });
    };

    const handleComplete = async (value) => {
        submit(value);
        setLoadindg(true);
    };

    return (
        <div className="font-logo pb-10 px-2 flex flex-col">
            {status === false && <Header />}
            <Toaster className="z-30"/>
            {status === false && (
                <div>
                    <div className="container p-6 m-auto rounded-md lg:max-w-xl flex flex-col gap-5">
                        <div className="flex flex-col gap-2">
                            <span className="text-3xl font-semibold text-start text-[--site-main-Login1]">
                                AI Bots
                            </span>
                            <span className="text-start">
                                Log in to your account
                            </span>
                        </div>
                        {isloading ? (
                            <div className="flex items-center justify-center mt-6">
                                <ReactLoading
                                    type="spin"
                                    color="#153144"
                                    height={40}
                                    width={40}
                                    delay={15}
                                ></ReactLoading>
                            </div>
                        ) : (
                            <div className="mt-6 flex flex-col gap-5">
                                <div className="gap-2 flex flex-col">
                                    <label
                                        htmlFor="username"
                                        className="text-md font-medium text-[--site-main-Login-Text]"
                                    >
                                        Organisation ID
                                    </label>
                                    <input
                                        type="text"
                                        onChange={(e) =>
                                            setOrganization(e.target.value)
                                        }
                                        placeholder="First, enter your Organisation ID."
                                        className="w-full p-4 text-[--site-main-Login] border rounded-md border-gray-800"
                                        required
                                    />
                                </div>
                                <div className="gap-2 flex flex-col">
                                    <label
                                        htmlFor="email"
                                        className="text-md font-medium text-[--site-main-Login-Text]"
                                    >
                                        PIN
                                    </label>
                                    <div className="flex gap-2">
                                        <PinField
                                            name="chatdescription"
                                            length={6}
                                            type="password"
                                            inputMode="numeric"
                                            onRejectKey={() => {
                                                SetValidate(true);
                                            }}
                                            onResolveKey={() => {
                                                SetValidate(false);
                                            }}
                                            ref={pinField}
                                            validate="0123456789"
                                            onComplete={handleComplete}
                                            className="p-4 items-center justify-center w-1/6 text-center text-[--site-card-icon-color] border rounded-md border-gray-800"
                                        />
                                    </div>
                                    <div className="mb=2">
                                        {validate && (
                                            <span className="text-[--site-main-form-error] text-[12px]">
                                                The PIN must be number
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
            {chat && status && <Outlet />}
        </div>
    );
};

export default AccessChatbot;
